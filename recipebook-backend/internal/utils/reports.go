package utils

import (
	"bytes"
	"fmt"
	"time"

	"recipebook/internal/models"

	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
)

// GenerateFavoritesXLSX returns XLSX bytes for favorites report
func GenerateFavoritesXLSX(favs []models.Favorite) ([]byte, error) {
	f := excelize.NewFile()
	sheet := "Избранное"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"#", "Название рецепта", "Категория", "Сложность", "Время (мин)"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, fav := range favs {
		row := i + 2
		category := ""
		if fav.Recipe != nil && fav.Recipe.Category != nil {
			category = fav.Recipe.Category.Name
		}
		title := ""
		difficulty := ""
		cookTime := 0
		if fav.Recipe != nil {
			title = fav.Recipe.Title
			difficulty = fav.Recipe.Difficulty
			cookTime = fav.Recipe.CookTime
		}
		vals := []interface{}{i + 1, title, category, difficulty, cookTime}
		for j, v := range vals {
			cell, _ := excelize.CoordinatesToCellName(j+1, row)
			f.SetCellValue(sheet, cell, v)
		}
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// CategoryStat for categories report
type CategoryStat struct {
	Name        string
	RecipeCount int64
}

func GenerateCategoriesXLSX(stats []CategoryStat) ([]byte, error) {
	f := excelize.NewFile()
	sheet := "По категориям"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"#", "Категория", "Количество рецептов"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}
	for i, s := range stats {
		row := i + 2
		vals := []interface{}{i + 1, s.Name, s.RecipeCount}
		for j, v := range vals {
			cell, _ := excelize.CoordinatesToCellName(j+1, row)
			f.SetCellValue(sheet, cell, v)
		}
	}
	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func newPDF() *gofpdf.Fpdf {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	ensureFonts()
	if fontRegular != "" {
		pdf.AddUTF8Font("DejaVu", "", fontRegular)
		if fontBold != "" {
			pdf.AddUTF8Font("DejaVu", "B", fontBold)
		} else {
			pdf.AddUTF8Font("DejaVu", "B", fontRegular)
		}
		pdf.SetFont("DejaVu", "", 11)
	}
	return pdf
}

func GenerateFavoritesPDF(favs []models.Favorite) ([]byte, error) {
	pdf := newPDF()
	pdf.AddPage()
	pdf.SetFont("DejaVu", "B", 16)
	pdf.Cell(0, 10, "Избранные рецепты")
	pdf.Ln(12)
	pdf.SetFont("DejaVu", "", 11)

	for i, fav := range favs {
		title := ""
		category := ""
		if fav.Recipe != nil {
			title = fav.Recipe.Title
			if fav.Recipe.Category != nil {
				category = fav.Recipe.Category.Name
			}
		}
		line := fmt.Sprintf("%d. %s [%s]", i+1, title, category)
		pdf.Cell(0, 8, line)
		pdf.Ln(8)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func GenerateCategoriesPDF(stats []CategoryStat) ([]byte, error) {
	pdf := newPDF()
	pdf.AddPage()
	pdf.SetFont("DejaVu", "B", 16)
	pdf.Cell(0, 10, "Рецепты по категориям")
	pdf.Ln(12)
	pdf.SetFont("DejaVu", "", 11)

	for i, s := range stats {
		line := fmt.Sprintf("%d. %s — %d рецептов", i+1, s.Name, s.RecipeCount)
		pdf.Cell(0, 8, line)
		pdf.Ln(8)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func GenerateShoppingListPDF(plans []models.MenuPlan, weekStart time.Time) ([]byte, error) {
	mealNames := map[string]string{
		"breakfast": "Завтрак",
		"lunch":     "Обед",
		"dinner":    "Ужин",
	}
	dayNamesRu := []string{"Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"}

	// Group by date
	type dayEntry struct {
		label string
		date  string
		slots []models.MenuPlan
	}
	days := make([]dayEntry, 7)
	for i := 0; i < 7; i++ {
		d := weekStart.AddDate(0, 0, i)
		days[i] = dayEntry{
			label: fmt.Sprintf("%s (%s)", dayNamesRu[i], d.Format("02.01")),
			date:  d.Format("2006-01-02"),
		}
	}
	for _, p := range plans {
		ds := p.Date.Format("2006-01-02")
		for i := range days {
			if days[i].date == ds {
				days[i].slots = append(days[i].slots, p)
				break
			}
		}
	}

	// Aggregate all ingredients
	ingredientMap := map[string]string{}
	for _, p := range plans {
		if p.Recipe == nil {
			continue
		}
		for _, ing := range p.Recipe.Ingredients {
			if existing, ok := ingredientMap[ing.Name]; ok {
				ingredientMap[ing.Name] = existing + " + " + ing.Amount
			} else {
				ingredientMap[ing.Name] = ing.Amount
			}
		}
	}

	pdf := newPDF()
	pdf.AddPage()

	// Title
	pdf.SetFont("DejaVu", "B", 16)
	pdf.Cell(0, 10, fmt.Sprintf("Меню на неделю с %s", weekStart.Format("02.01.2006")))
	pdf.Ln(14)

	// === SECTION 1: Recipes by day ===
	pdf.SetFont("DejaVu", "B", 13)
	pdf.Cell(0, 8, "Рецепты по дням")
	pdf.Ln(10)

	mealOrder := []string{"breakfast", "lunch", "dinner"}
	for _, day := range days {
		if len(day.slots) == 0 {
			continue
		}
		pdf.SetFont("DejaVu", "B", 11)
		pdf.SetFillColor(245, 245, 245)
		pdf.CellFormat(0, 7, day.label, "", 1, "", true, 0, "")
		pdf.Ln(1)

		slotMap := map[string]models.MenuPlan{}
		for _, s := range day.slots {
			slotMap[s.MealType] = s
		}

		for _, mt := range mealOrder {
			s, ok := slotMap[mt]
			if !ok || s.Recipe == nil {
				continue
			}
			mealLabel := mealNames[mt]
			pdf.SetFont("DejaVu", "B", 10)
			pdf.Cell(30, 6, mealLabel+":")
			pdf.SetFont("DejaVu", "", 10)
			pdf.Cell(0, 6, s.Recipe.Title)
			pdf.Ln(6)

			if len(s.Recipe.Ingredients) > 0 {
				pdf.SetFont("DejaVu", "", 9)
				for _, ing := range s.Recipe.Ingredients {
					pdf.Cell(10, 5, "")
					pdf.Cell(0, 5, fmt.Sprintf("- %s: %s", ing.Name, ing.Amount))
					pdf.Ln(5)
				}
			}
			pdf.Ln(2)
		}
		pdf.Ln(3)
	}

	// === SECTION 2: All recipes of the week ===
	if pdf.GetY() > 220 {
		pdf.AddPage()
	}
	pdf.SetFont("DejaVu", "B", 13)
	pdf.Cell(0, 8, "Все рецепты на неделю")
	pdf.Ln(10)

	seen := map[uint]bool{}
	recipeNum := 1
	for _, p := range plans {
		if p.Recipe == nil || seen[p.RecipeID] {
			continue
		}
		seen[p.RecipeID] = true
		pdf.SetFont("DejaVu", "B", 10)
		pdf.Cell(0, 6, fmt.Sprintf("%d. %s", recipeNum, p.Recipe.Title))
		pdf.Ln(6)
		recipeNum++
		if len(p.Recipe.Ingredients) > 0 {
			pdf.SetFont("DejaVu", "", 9)
			for _, ing := range p.Recipe.Ingredients {
				pdf.Cell(8, 5, "")
				pdf.Cell(0, 5, fmt.Sprintf("- %s: %s", ing.Name, ing.Amount))
				pdf.Ln(5)
			}
		}
		if len(p.Recipe.Steps) > 0 {
			pdf.SetFont("DejaVu", "", 9)
			for si, step := range p.Recipe.Steps {
				pdf.Cell(8, 5, "")
				stepText := fmt.Sprintf("Шаг %d: %s", si+1, step.Description)
				pdf.MultiCell(0, 5, stepText, "", "", false)
			}
		}
		pdf.Ln(4)
	}

	// === SECTION 3: Shopping list (all ingredients) ===
	if pdf.GetY() > 220 {
		pdf.AddPage()
	}
	pdf.SetFont("DejaVu", "B", 13)
	pdf.Cell(0, 8, "Список покупок (все ингредиенты)")
	pdf.Ln(10)
	pdf.SetFont("DejaVu", "", 11)

	i := 1
	for name, amount := range ingredientMap {
		pdf.Cell(0, 7, fmt.Sprintf("%d. %s — %s", i, name, amount))
		pdf.Ln(7)
		i++
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
