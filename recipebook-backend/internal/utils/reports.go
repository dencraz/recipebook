package utils

import (
	"bytes"
	"fmt"
	"path/filepath"
	"sort"
	"time"

	gofpdf "github.com/go-pdf/fpdf"
	"github.com/xuri/excelize/v2"

	"recipebook/internal/models"
)

// ─── XLSX ─────────────────────────────────────────────────────────────────────

var difficultyRu = map[string]string{
	"easy":   "Лёгкий",
	"medium": "Средний",
	"hard":   "Сложный",
}

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
			d := fav.Recipe.Difficulty
			if ru, ok := difficultyRu[d]; ok {
				difficulty = ru
			} else {
				difficulty = d
			}
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

// ─── PDF (go-pdf/fpdf) ────────────────────────────────────────────────────────

const (
	pdfMargin = 15.0  // мм, все стороны
	pdfFW     = 180.0 // A4 210мм − 2×15мм
)

var (
	mealNamesRu = map[string]string{
		"breakfast": "Завтрак",
		"lunch":     "Обед",
		"dinner":    "Ужин",
	}
	mealOrder = []string{"breakfast", "lunch", "dinner"}
	dayNamesRu = []string{
		"Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье",
	}
)

// pdfCtx оборачивает fpdf.Fpdf и хранит имя семейства шрифтов.
type pdfCtx struct {
	f   *gofpdf.Fpdf
	fam string
}

// newPDFCtx создаёт экземпляр с поддержкой кириллицы через UTF-8-шрифт.
func newPDFCtx() (*pdfCtx, error) {
	ensureFonts()

	// go-pdf/fpdf ищет файлы шрифтов относительно fontDirStr,
	// поэтому передаём директорию в New(), а в AddUTF8Font — только имя файла.
	fontDir := ""
	if fontRegular != "" {
		fontDir = filepath.Dir(fontRegular)
	}

	f := gofpdf.New("P", "mm", "A4", fontDir)
	f.SetMargins(pdfMargin, pdfMargin, pdfMargin)
	f.SetAutoPageBreak(true, 20)

	fam := "Helvetica"
	if fontRegular != "" {
		fam = "sans"
		boldPath := fontRegular
		if fontBold != "" {
			boldPath = fontBold
		}
		f.AddUTF8Font("sans", "", filepath.Base(fontRegular))
		f.AddUTF8Font("sans", "B", filepath.Base(boldPath))
		if err := f.Error(); err != nil {
			return nil, fmt.Errorf("PDF: ошибка загрузки шрифта: %w", err)
		}
	}

	return &pdfCtx{f: f, fam: fam}, nil
}

func (p *pdfCtx) sf(bold bool, size float64) {
	style := ""
	if bold {
		style = "B"
	}
	p.f.SetFont(p.fam, style, size)
}

func (p *pdfCtx) tc(r, g, b int) { p.f.SetTextColor(r, g, b) }
func (p *pdfCtx) fc(r, g, b int) { p.f.SetFillColor(r, g, b) }

func (p *pdfCtx) toBytes() ([]byte, error) {
	var buf bytes.Buffer
	if err := p.f.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// band — полноширинная цветная полоса с текстом.
func (p *pdfCtx) band(text string, bold bool, size, h, topGap, botGap float64, tr, tg, tb, fr, fg, fb int) {
	if topGap > 0 {
		p.f.Ln(topGap)
	}
	p.sf(bold, size)
	p.tc(tr, tg, tb)
	p.fc(fr, fg, fb)
	p.f.CellFormat(pdfFW, h, "  "+text, "", 1, "L", true, 0, "")
	if botGap > 0 {
		p.f.Ln(botGap)
	}
}

func (p *pdfCtx) sectionHeader(text string) {
	p.band(text, true, 11, 8, 5, 3, 255, 255, 255, 210, 90, 20)
}

func (p *pdfCtx) dayHeader(text string) {
	p.band(text, true, 9, 7, 3, 2, 80, 50, 10, 245, 228, 205)
}

func (p *pdfCtx) ingTotalBand(text string) {
	p.band(text, true, 8, 6, 2, 1, 80, 50, 10, 250, 243, 230)
}

// textRow — строка текста с необязательным отступом слева.
func (p *pdfCtx) textRow(text string, indent, size float64, bold bool, tr, tg, tb int) {
	h := size*0.42 + 2.5
	p.sf(bold, size)
	p.tc(tr, tg, tb)
	if indent > 0 {
		p.f.SetX(pdfMargin + indent)
	}
	p.f.CellFormat(pdfFW-indent, h, text, "", 1, "L", false, 0, "")
}

// mealRow — строка «Завтрак: <блюдо> (N ингр.)».
func (p *pdfCtx) mealRow(meal, title string, ingCount int) {
	suffix := title
	if ingCount > 0 {
		suffix += fmt.Sprintf("  (%d ингр.)", ingCount)
	}
	h := 5.5
	p.sf(true, 9)
	p.tc(0, 0, 0)
	labelW := p.f.GetStringWidth(meal+":") + 3
	p.f.SetX(pdfMargin + 8)
	p.f.CellFormat(labelW, h, meal+":", "", 0, "L", false, 0, "")
	p.sf(false, 9)
	p.f.CellFormat(pdfFW-8-labelW, h, "  "+suffix, "", 1, "L", false, 0, "")
}

// ingRow — строка «N. ингредиент — количество» с чередующимся фоном.
func (p *pdfCtx) ingRow(idx int, name, amount string, fr, fg, fb int) {
	h := 6.0
	p.fc(fr, fg, fb)
	p.sf(true, 9)
	p.tc(80, 50, 10)
	p.f.CellFormat(9, h, fmt.Sprintf("%d.", idx), "", 0, "R", true, 0, "")
	p.sf(false, 9)
	p.tc(0, 0, 0)
	p.f.CellFormat(pdfFW-9, h, "  "+name+"  —  "+amount, "", 1, "L", true, 0, "")
}

// tableHeader3 — заголовок таблицы из 3 колонок (оранжевый фон).
func (p *pdfCtx) tableHeader3(h1, h2, h3 string, w1, w2, w3 float64) {
	rh := 7.0
	p.sf(true, 9)
	p.tc(255, 255, 255)
	p.fc(210, 90, 20)
	p.f.CellFormat(w1, rh, "  "+h1, "1", 0, "L", true, 0, "")
	p.f.CellFormat(w2, rh, h2, "1", 0, "C", true, 0, "")
	p.f.CellFormat(w3, rh, h3, "1", 1, "C", true, 0, "")
}

// tableRow3 — строка данных таблицы из 3 колонок.
func (p *pdfCtx) tableRow3(v1, v2, v3 string, w1, w2, w3 float64, fr, fg, fb int) {
	rh := 6.5
	p.sf(false, 8.5)
	p.tc(0, 0, 0)
	p.fc(fr, fg, fb)
	p.f.CellFormat(w1, rh, "  "+v1, "", 0, "L", true, 0, "")
	p.f.CellFormat(w2, rh, v2, "", 0, "C", true, 0, "")
	p.f.CellFormat(w3, rh, v3, "", 1, "C", true, 0, "")
}

// ─── Favorites PDF ────────────────────────────────────────────────────────────

func GenerateFavoritesPDF(favs []models.Favorite) ([]byte, error) {
	p, err := newPDFCtx()
	if err != nil {
		return nil, err
	}
	p.f.AddPage()

	p.sf(true, 20)
	p.tc(180, 70, 0)
	p.f.CellFormat(pdfFW, 12, "Избранные рецепты", "", 1, "L", false, 0, "")
	p.f.Ln(6)

	for i, fav := range favs {
		if fav.Recipe == nil {
			continue
		}
		cat := ""
		if fav.Recipe.Category != nil {
			cat = "  [" + fav.Recipe.Category.Name + "]"
		}
		line := fmt.Sprintf("%d. %s%s", i+1, fav.Recipe.Title, cat)
		p.textRow(line, 0, 10, false, 0, 0, 0)
	}

	return p.toBytes()
}

// ─── Categories PDF ───────────────────────────────────────────────────────────

func GenerateCategoriesPDF(stats []CategoryStat) ([]byte, error) {
	p, err := newPDFCtx()
	if err != nil {
		return nil, err
	}
	p.f.AddPage()

	p.sf(true, 20)
	p.tc(180, 70, 0)
	p.f.CellFormat(pdfFW, 12, "Рецепты по категориям", "", 1, "L", false, 0, "")
	p.f.Ln(6)

	for i, s := range stats {
		line := fmt.Sprintf("%d. %s — %d рецептов", i+1, s.Name, s.RecipeCount)
		p.textRow(line, 0, 10, false, 0, 0, 0)
	}

	return p.toBytes()
}

// ─── Shopping List PDF ────────────────────────────────────────────────────────

type dayData struct {
	label   string
	dateStr string
	meals   map[string]*models.Recipe
}

// GenerateShoppingListPDF строит PDF из трёх разделов:
//  1. Расписание на неделю — приёмы пищи по дням, количество блюд
//  2. Ингредиенты по дням — разбивка по блюдам + итого уникальных за день
//  3. Список покупок на всю неделю — уникальные ингредиенты с суммарным количеством
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
		pp := &plans[i]
		if pp.Recipe == nil {
			continue
		}
		ds := pp.Date.Format("2006-01-02")
		for j := range days {
			if days[j].dateStr == ds {
				days[j].meals[pp.MealType] = pp.Recipe
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

	weekEnd := weekStart.AddDate(0, 0, 6)

	// ── создание PDF ──────────────────────────────────────────────────────────
	p, err := newPDFCtx()
	if err != nil {
		return nil, err
	}

	// ══════════════════════════════════════════════════════════════════════════
	// Титульная страница
	// ══════════════════════════════════════════════════════════════════════════
	p.f.AddPage()

	p.sf(true, 22)
	p.tc(180, 70, 0)
	p.f.CellFormat(pdfFW, 13, "Список покупок на неделю", "", 1, "L", false, 0, "")
	p.f.Ln(3)

	p.sf(false, 11)
	p.tc(100, 100, 100)
	p.f.CellFormat(pdfFW, 7,
		fmt.Sprintf("Период: %s — %s", weekStart.Format("02.01.2006"), weekEnd.Format("02.01.2006")),
		"", 1, "L", false, 0, "")
	p.f.CellFormat(pdfFW, 7,
		fmt.Sprintf("Блюд запланировано: %d  |  Уникальных ингредиентов: %d",
			totalDishes, len(weekIngOrder)),
		"", 1, "L", false, 0, "")
	p.f.Ln(10)

	// Сводная таблица по дням
	w1, w2, w3 := pdfFW*0.55, pdfFW*0.22, pdfFW*0.23
	p.tableHeader3("День", "Блюд", "Ингредиентов", w1, w2, w3)
	for i, day := range days {
		ingCount := 0
		for _, mt := range mealOrder {
			if r := day.meals[mt]; r != nil {
				ingCount += len(r.Ingredients)
			}
		}
		fr, fg, fb := 252, 252, 252
		if i%2 == 1 {
			fr, fg, fb = 243, 243, 243
		}
		p.tableRow3(
			day.label,
			fmt.Sprintf("%d", len(day.meals)),
			fmt.Sprintf("%d", ingCount),
			w1, w2, w3,
			fr, fg, fb,
		)
	}
	p.f.Ln(5)

	// ══════════════════════════════════════════════════════════════════════════
	// РАЗДЕЛ 1 — Расписание приёмов пищи
	// ══════════════════════════════════════════════════════════════════════════
	p.sectionHeader("Раздел 1: Расписание приёмов пищи")

	for _, day := range days {
		dishCount := len(day.meals)
		p.dayHeader(fmt.Sprintf("%s  [%d блюд]", day.label, dishCount))

		if dishCount == 0 {
			p.textRow("нет запланированных блюд", 10, 9, false, 100, 100, 100)
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
			p.mealRow(mealNamesRu[mt], title, ingCount)
		}
	}

	// ══════════════════════════════════════════════════════════════════════════
	// РАЗДЕЛ 2 — Ингредиенты по дням
	// ══════════════════════════════════════════════════════════════════════════
	p.f.AddPage()
	p.sectionHeader("Раздел 2: Ингредиенты по дням")

	for _, day := range days {
		if len(day.meals) == 0 {
			continue
		}
		p.dayHeader(fmt.Sprintf("%s  [%d блюд]", day.label, len(day.meals)))

		dayIngMap := map[string][]string{}
		dayIngOrder := []string{}

		for _, mt := range mealOrder {
			r := day.meals[mt]
			if r == nil {
				continue
			}
			p.textRow(mealNamesRu[mt]+": "+r.Title, 8, 9, true, 0, 0, 0)

			if len(r.Ingredients) == 0 {
				p.textRow("нет ингредиентов", 18, 8, false, 100, 100, 100)
				p.f.Ln(1)
				continue
			}
			for _, ing := range r.Ingredients {
				p.textRow("• "+ing.Name+"  —  "+ing.Amount, 18, 8.5, false, 0, 0, 0)
				if _, exists := dayIngMap[ing.Name]; !exists {
					dayIngOrder = append(dayIngOrder, ing.Name)
				}
				dayIngMap[ing.Name] = append(dayIngMap[ing.Name], ing.Amount)
			}
			p.f.Ln(2)
		}

		if len(dayIngOrder) > 0 {
			p.ingTotalBand(fmt.Sprintf("Итого за день: %d уникальных ингредиента(-ов)", len(dayIngOrder)))
			for i, name := range dayIngOrder {
				fr, fg, fb := 252, 252, 252
				if i%2 == 1 {
					fr, fg, fb = 243, 243, 243
				}
				p.ingRow(i+1, name, mergeAmounts(dayIngMap[name]), fr, fg, fb)
			}
		}
		p.f.Ln(6)
	}

	// ══════════════════════════════════════════════════════════════════════════
	// РАЗДЕЛ 3 — Список покупок на всю неделю
	// ══════════════════════════════════════════════════════════════════════════
	p.f.AddPage()
	p.sectionHeader("Раздел 3: Список покупок на всю неделю")

	p.sf(false, 10)
	p.tc(100, 100, 100)
	p.f.CellFormat(pdfFW, 6,
		fmt.Sprintf("Всего уникальных ингредиентов: %d", len(weekIngOrder)),
		"", 1, "L", false, 0, "")
	p.f.Ln(4)

	if len(weekIngOrder) == 0 {
		p.textRow("На эту неделю блюда не запланированы.", 0, 10, false, 100, 100, 100)
	} else {
		for idx, name := range weekIngOrder {
			fr, fg, fb := 252, 252, 252
			if idx%2 == 1 {
				fr, fg, fb = 243, 243, 243
			}
			p.ingRow(idx+1, name, mergeAmounts(weekIngMap[name].amounts), fr, fg, fb)
		}
	}

	return p.toBytes()
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
