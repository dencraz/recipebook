package utils

import (
	"bytes"
	"fmt"
	"sort"
	"time"

	"github.com/unidoc/unipdf/v3/creator"
	"github.com/unidoc/unipdf/v3/model"
	"github.com/xuri/excelize/v2"

	"recipebook/internal/models"
)

// ─── XLSX ─────────────────────────────────────────────────────────────────────

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
		category, title, difficulty, cookTime := "", "", "", 0
		if fav.Recipe != nil {
			title = fav.Recipe.Title
			difficulty = fav.Recipe.Difficulty
			cookTime = fav.Recipe.CookTime
			if fav.Recipe.Category != nil {
				category = fav.Recipe.Category.Name
			}
		}
		for j, v := range []interface{}{i + 1, title, category, difficulty, cookTime} {
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
		for j, v := range []interface{}{i + 1, s.Name, s.RecipeCount} {
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

// ─── PDF builder (unipdf) ─────────────────────────────────────────────────────

// Палитра цветов документа.
var (
	clrOrange  = creator.ColorRGBFrom8bit(210, 90, 20)
	clrBeige   = creator.ColorRGBFrom8bit(245, 228, 205)
	clrBrown   = creator.ColorRGBFrom8bit(80, 50, 10)
	clrTitle   = creator.ColorRGBFrom8bit(180, 70, 0)
	clrGray    = creator.ColorRGBFrom8bit(100, 100, 100)
	clrWhite   = creator.ColorRGBFrom8bit(255, 255, 255)
	clrBlack   = creator.ColorRGBFrom8bit(0, 0, 0)
	clrRow1    = creator.ColorRGBFrom8bit(252, 252, 252)
	clrRow2    = creator.ColorRGBFrom8bit(243, 243, 243)
	clrSummary = creator.ColorRGBFrom8bit(250, 243, 230)
)

type pdfBuilder struct {
	c    *creator.Creator
	reg  *model.PdfFont
	bold *model.PdfFont
}

// newPDFBuilder создаёт Creator (unipdf) с загруженными TTF-шрифтами.
func newPDFBuilder() (*pdfBuilder, error) {
	ensureFonts() // гарантирует, что fontRegular/fontBold указывают на TTF-файлы

	c := creator.New()
	c.SetPageSize(creator.PageSizeA4)
	c.SetPageMargins(42, 42, 42, 42) // ≈15 мм с каждой стороны

	reg, err := openFont(fontRegular, model.HelveticaName)
	if err != nil {
		return nil, fmt.Errorf("PDF: не удалось загрузить шрифт: %w", err)
	}
	bold, _ := openFont(fontBold, model.HelveticaBoldName)
	if bold == nil {
		bold = reg
	}

	return &pdfBuilder{c: c, reg: reg, bold: bold}, nil
}

// openFont загружает TTF-файл; при неудаче откатывается на стандартный шрифт PDF.
func openFont(ttfPath string, fallback model.StandardFont) (*model.PdfFont, error) {
	if ttfPath != "" {
		if f, err := model.NewPdfFontFromTTFFile(ttfPath); err == nil {
			return f, nil
		}
	}
	return model.NewStandard14Font(fallback)
}

// toBytes сериализует PDF в []byte.
func (b *pdfBuilder) toBytes() ([]byte, error) {
	var buf bytes.Buffer
	if err := b.c.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// par создаёт параграф с заданным шрифтом, размером, цветом и отступами.
func (b *pdfBuilder) par(text string, font *model.PdfFont, size float64, clr creator.Color, leftPad, bottomPad float64) *creator.Paragraph {
	p := b.c.NewParagraph(text)
	p.SetFont(font)
	p.SetFontSize(size)
	p.SetColor(clr)
	p.SetMargins(leftPad, 0, 0, bottomPad)
	return p
}

// drawPar рисует параграф.
func (b *pdfBuilder) drawPar(text string, font *model.PdfFont, size float64, clr creator.Color, leftPad, bottomPad float64) error {
	return b.c.Draw(b.par(text, font, size, clr, leftPad, bottomPad))
}

// bandTable рисует полноширинную полосу с цветным фоном и текстом.
func (b *pdfBuilder) bandTable(text string, textFont *model.PdfFont, fontSize float64,
	textClr, bgClr creator.Color, topMargin, botMargin float64) error {

	t := b.c.NewTable(1)
	t.SetColumnWidths(1.0)
	t.SetMargins(0, 0, topMargin, botMargin)

	cell := t.NewCell()
	p := b.par("  "+text, textFont, fontSize, textClr, 0, 0)
	cell.SetContent(p)
	cell.SetBackgroundColor(bgClr)
	return b.c.Draw(t)
}

// sectionHeader — оранжевая полоса для раздела.
func (b *pdfBuilder) sectionHeader(text string) error {
	return b.bandTable(text, b.bold, 12, clrWhite, clrOrange, 10, 5)
}

// dayHeader — бежевая полоса для дня.
func (b *pdfBuilder) dayHeader(text string) error {
	return b.bandTable(text, b.bold, 10, clrBrown, clrBeige, 4, 2)
}

// mealRow рисует строку приёма пищи: "  [Завтрак]  Название рецепта (N ингр.)".
func (b *pdfBuilder) mealRow(mealName, recipeName string, ingCount int) error {
	sp := b.c.NewStyledParagraph()
	sp.SetMargins(8, 0, 0, 3)

	label := sp.Append(mealName + ":  ")
	label.Style.Font = b.bold
	label.Style.FontSize = 9
	label.Style.Color = clrBlack

	suffix := recipeName
	if ingCount > 0 {
		suffix += fmt.Sprintf("  (%d ингр.)", ingCount)
	}
	val := sp.Append(suffix)
	val.Style.Font = b.reg
	val.Style.FontSize = 9
	val.Style.Color = clrBlack

	return b.c.Draw(sp)
}

// ingRow рисует строку ингредиента с маркером «•».
func (b *pdfBuilder) ingRow(name, amount string, indent float64) error {
	return b.drawPar("• "+name+"  —  "+amount, b.reg, 9, clrBlack, indent, 2)
}

// summaryIngRow рисует строку в блоке «Итого за день» / «Список покупок».
func (b *pdfBuilder) summaryIngRow(num int, name, amount string, bgClr creator.Color) error {
	t := b.c.NewTable(2)
	t.SetColumnWidths(0.08, 0.92)
	t.SetMargins(0, 0, 0, 0)

	numCell := t.NewCell()
	numCell.SetBackgroundColor(bgClr)
	numCell.SetHorizontalAlignment(creator.CellHorizontalAlignmentRight)
	np := b.par(fmt.Sprintf("%d.", num), b.bold, 9, clrBlack, 0, 0)
	numCell.SetContent(np)

	valCell := t.NewCell()
	valCell.SetBackgroundColor(bgClr)
	vp := b.par("  "+name+"  —  "+amount, b.reg, 9, clrBlack, 0, 0)
	valCell.SetContent(vp)

	return b.c.Draw(t)
}

// ─── Favorites PDF ────────────────────────────────────────────────────────────

func GenerateFavoritesPDF(favs []models.Favorite) ([]byte, error) {
	b, err := newPDFBuilder()
	if err != nil {
		return nil, err
	}
	b.c.NewPage()

	b.drawPar("Избранные рецепты", b.bold, 20, clrTitle, 0, 12)

	for i, fav := range favs {
		if fav.Recipe == nil {
			continue
		}
		cat := ""
		if fav.Recipe.Category != nil {
			cat = "  [" + fav.Recipe.Category.Name + "]"
		}
		line := fmt.Sprintf("%d. %s%s", i+1, fav.Recipe.Title, cat)
		b.drawPar(line, b.reg, 10, clrBlack, 0, 4)
	}

	return b.toBytes()
}

// ─── Categories PDF ───────────────────────────────────────────────────────────

func GenerateCategoriesPDF(stats []CategoryStat) ([]byte, error) {
	b, err := newPDFBuilder()
	if err != nil {
		return nil, err
	}
	b.c.NewPage()

	b.drawPar("Рецепты по категориям", b.bold, 20, clrTitle, 0, 12)

	for i, s := range stats {
		line := fmt.Sprintf("%d. %s — %d рецептов", i+1, s.Name, s.RecipeCount)
		b.drawPar(line, b.reg, 10, clrBlack, 0, 4)
	}

	return b.toBytes()
}

// ─── Shopping List PDF ────────────────────────────────────────────────────────

var mealNamesRu = map[string]string{
	"breakfast": "Завтрак",
	"lunch":     "Обед",
	"dinner":    "Ужин",
}
var mealOrder = []string{"breakfast", "lunch", "dinner"}
var dayNamesRu = []string{
	"Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье",
}

type dayData struct {
	label   string
	dateStr string
	meals   map[string]*models.Recipe
}

// GenerateShoppingListPDF строит PDF из трёх разделов:
//  1. Расписание на неделю — приёмы пищи по дням, кол-во блюд
//  2. Ингредиенты по дням — разбивка по блюдам + итого уникальных за день
//  3. Список покупок на всю неделю — уникальные ингредиенты с суммарным кол-вом
func GenerateShoppingListPDF(plans []models.MenuPlan, weekStart time.Time) ([]byte, error) {
	// ── сетка дней ───────────────────────────────────────────────────────────
	days := make([]dayData, 7)
	for i := 0; i < 7; i++ {
		d := weekStart.AddDate(0, 0, i)
		days[i] = dayData{
			label:   fmt.Sprintf("%s, %s", dayNamesRu[i], d.Format("02.01.2006")),
			dateStr: d.Format("2006-01-02"),
			meals:   map[string]*models.Recipe{},
		}
	}
	for i := range plans {
		p := &plans[i]
		if p.Recipe == nil {
			continue
		}
		ds := p.Date.Format("2006-01-02")
		for j := range days {
			if days[j].dateStr == ds {
				days[j].meals[p.MealType] = p.Recipe
				break
			}
		}
	}

	// ── недельный список ингредиентов ─────────────────────────────────────────
	type ingEntry struct{ amounts []string }
	weekIngMap := map[string]*ingEntry{}
	weekIngOrder := []string{}

	for i := range plans {
		if plans[i].Recipe == nil {
			continue
		}
		for _, ing := range plans[i].Recipe.Ingredients {
			if _, ok := weekIngMap[ing.Name]; !ok {
				weekIngOrder = append(weekIngOrder, ing.Name)
				weekIngMap[ing.Name] = &ingEntry{}
			}
			weekIngMap[ing.Name].amounts = append(weekIngMap[ing.Name].amounts, ing.Amount)
		}
	}
	sort.Strings(weekIngOrder)

	totalDishes := 0
	for _, d := range days {
		totalDishes += len(d.meals)
	}

	// ── PDF builder ───────────────────────────────────────────────────────────
	b, err := newPDFBuilder()
	if err != nil {
		return nil, err
	}

	weekEnd := weekStart.AddDate(0, 0, 6)

	// ════════════════════════════════════════════════════════════════════════
	// Титульная страница
	// ════════════════════════════════════════════════════════════════════════
	b.c.NewPage()

	b.drawPar("Список покупок на неделю", b.bold, 22, clrTitle, 0, 8)
	b.drawPar(
		fmt.Sprintf("Период: %s — %s", weekStart.Format("02.01.2006"), weekEnd.Format("02.01.2006")),
		b.reg, 11, clrGray, 0, 4,
	)
	b.drawPar(
		fmt.Sprintf("Блюд запланировано: %d  |  Уникальных ингредиентов: %d",
			totalDishes, len(weekIngOrder)),
		b.reg, 10, clrGray, 0, 12,
	)

	// Сводная таблица по дням.
	summaryTable := b.c.NewTable(3)
	summaryTable.SetColumnWidths(0.55, 0.22, 0.23)
	summaryTable.SetMargins(0, 0, 0, 14)

	for _, hdr := range []string{"День", "Блюд", "Ингредиентов"} {
		cell := summaryTable.NewCell()
		cell.SetBackgroundColor(clrOrange)
		p := b.par(hdr, b.bold, 9, clrWhite, 4, 0)
		cell.SetContent(p)
		cell.SetHorizontalAlignment(creator.CellHorizontalAlignmentCenter)
	}
	for i, day := range days {
		ingCount := 0
		for _, mt := range mealOrder {
			if r := day.meals[mt]; r != nil {
				ingCount += len(r.Ingredients)
			}
		}
		bg := clrRow1
		if i%2 == 1 {
			bg = clrRow2
		}
		for ci, txt := range []string{day.label, fmt.Sprintf("%d", len(day.meals)), fmt.Sprintf("%d", ingCount)} {
			cell := summaryTable.NewCell()
			cell.SetBackgroundColor(bg)
			align := creator.CellHorizontalAlignmentLeft
			if ci > 0 {
				align = creator.CellHorizontalAlignmentCenter
			}
			cell.SetHorizontalAlignment(align)
			cell.SetContent(b.par("  "+txt, b.reg, 9, clrBlack, 0, 0))
		}
	}
	b.c.Draw(summaryTable)

	// ════════════════════════════════════════════════════════════════════════
	// РАЗДЕЛ 1 — Расписание приёмов пищи
	// ════════════════════════════════════════════════════════════════════════
	b.sectionHeader("Раздел 1: Расписание приёмов пищи")

	for _, day := range days {
		dishCount := len(day.meals)
		b.dayHeader(fmt.Sprintf("%s  [%d блюд]", day.label, dishCount))

		if dishCount == 0 {
			b.drawPar("нет запланированных блюд", b.reg, 9, clrGray, 12, 4)
			continue
		}
		for _, mt := range mealOrder {
			r := day.meals[mt]
			title := "—"
			ingCount := 0
			if r != nil {
				title = r.Title
				ingCount = len(r.Ingredients)
			}
			b.mealRow(mealNamesRu[mt], title, ingCount)
		}
		b.drawPar("", b.reg, 4, clrBlack, 0, 0) // отступ между днями
	}

	// ════════════════════════════════════════════════════════════════════════
	// РАЗДЕЛ 2 — Ингредиенты по дням
	// ════════════════════════════════════════════════════════════════════════
	b.c.NewPage()
	b.sectionHeader("Раздел 2: Ингредиенты по дням")

	for _, day := range days {
		if len(day.meals) == 0 {
			continue
		}
		b.dayHeader(fmt.Sprintf("%s  [%d блюд]", day.label, len(day.meals)))

		dayIngMap := map[string][]string{}
		dayIngOrder := []string{}

		for _, mt := range mealOrder {
			r := day.meals[mt]
			if r == nil {
				continue
			}
			// Подзаголовок приёма пищи.
			b.drawPar(mealNamesRu[mt]+": "+r.Title, b.bold, 9, clrBlack, 8, 3)

			if len(r.Ingredients) == 0 {
				b.drawPar("нет ингредиентов", b.reg, 8, clrGray, 20, 3)
				continue
			}
			for _, ing := range r.Ingredients {
				b.ingRow(ing.Name, ing.Amount, 20)
				if _, exists := dayIngMap[ing.Name]; !exists {
					dayIngOrder = append(dayIngOrder, ing.Name)
				}
				dayIngMap[ing.Name] = append(dayIngMap[ing.Name], ing.Amount)
			}
			b.drawPar("", b.reg, 3, clrBlack, 0, 0)
		}

		// Итого за день.
		if len(dayIngOrder) > 0 {
			b.bandTable(
				fmt.Sprintf("Итого за день: %d уникальных ингредиента(-ов)", len(dayIngOrder)),
				b.bold, 9, clrBrown, clrSummary, 4, 2,
			)
			for i, name := range dayIngOrder {
				bg := clrRow1
				if i%2 == 1 {
					bg = clrRow2
				}
				b.summaryIngRow(i+1, name, mergeAmounts(dayIngMap[name]), bg)
			}
		}
		b.drawPar("", b.reg, 6, clrBlack, 0, 0)
	}

	// ════════════════════════════════════════════════════════════════════════
	// РАЗДЕЛ 3 — Список покупок на всю неделю
	// ════════════════════════════════════════════════════════════════════════
	b.c.NewPage()
	b.sectionHeader("Раздел 3: Список покупок на всю неделю")

	b.drawPar(
		fmt.Sprintf("Всего уникальных ингредиентов: %d", len(weekIngOrder)),
		b.reg, 10, clrGray, 0, 8,
	)

	if len(weekIngOrder) == 0 {
		b.drawPar("На эту неделю блюда не запланированы.", b.reg, 10, clrGray, 0, 0)
	} else {
		for idx, name := range weekIngOrder {
			bg := clrRow1
			if idx%2 == 1 {
				bg = clrRow2
			}
			b.summaryIngRow(idx+1, name, mergeAmounts(weekIngMap[name].amounts), bg)
		}
	}

	return b.toBytes()
}

// mergeAmounts объединяет список количеств одного ингредиента.
// Одинаковые значения схлопываются через "×N".
func mergeAmounts(amounts []string) string {
	if len(amounts) == 0 {
		return ""
	}
	if len(amounts) == 1 {
		return amounts[0]
	}
	cnt := map[string]int{}
	order := []string{}
	for _, a := range amounts {
		if cnt[a] == 0 {
			order = append(order, a)
		}
		cnt[a]++
	}
	result := ""
	for i, a := range order {
		if i > 0 {
			result += " + "
		}
		if cnt[a] > 1 {
			result += fmt.Sprintf("%s×%d", a, cnt[a])
		} else {
			result += a
		}
	}
	return result
}
