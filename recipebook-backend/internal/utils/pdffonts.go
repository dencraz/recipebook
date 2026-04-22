package utils

import (
	"log"
	"os"
	"path/filepath"
	"sync"
)

var (
	fontOnce      sync.Once
	fontRegular   string // путь к TTF regular
	fontBold      string // путь к TTF bold
	gofpdfFontDir string // директория с JSON-метриками gofpdf (helvetica.json и т.д.)
)

// gofpdf ищет helvetica.json и др. в fontDirStr переданном в New().
// В Docker runtime-образе они находятся в /app/font (скопированы из builder).
var gofpdfFontDirCandidates = []string{
	"/app/font",
	"./font",
	".",
}

// systemFontCandidates — системные шрифты с поддержкой кириллицы.
var systemFontCandidates = []struct{ regular, bold string }{
	{"/usr/share/fonts/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"},
	{"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"},
	{"/usr/share/fonts/truetype/freefont/FreeSans.ttf", "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"},
	{"C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"},
	{"/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"},
	{"/Library/Fonts/Arial.ttf", "/Library/Fonts/Arial Bold.ttf"},
}

func ensureFonts() {
	fontOnce.Do(initFonts)
}

func initFonts() {
	// Найти директорию с JSON-метриками gofpdf (нужна для core-шрифтов).
	for _, d := range gofpdfFontDirCandidates {
		if _, err := os.Stat(filepath.Join(d, "helvetica.json")); err == nil {
			gofpdfFontDir = d
			break
		}
	}

	// Приоритет: шрифт встроен в бинарник через -tags with_fonts.
	if len(fontBytesRegular) > 0 {
		dir := "/tmp/recipebook_fonts"
		if err := os.MkdirAll(dir, 0o755); err != nil {
			// Запасной вариант — стандартная tmp-директория ОС.
			dir = os.TempDir()
		}

		regularPath := filepath.Join(dir, "DejaVuSans.ttf")
		if err := os.WriteFile(regularPath, fontBytesRegular, 0o644); err != nil {
			log.Printf("[PDF] cannot write embedded regular font: %v", err)
		} else {
			fontRegular = regularPath
		}

		if len(fontBytesBold) > 0 {
			boldPath := filepath.Join(dir, "DejaVuSans-Bold.ttf")
			if err := os.WriteFile(boldPath, fontBytesBold, 0o644); err != nil {
				log.Printf("[PDF] cannot write embedded bold font: %v", err)
			} else {
				fontBold = boldPath
			}
		}
		if fontBold == "" {
			fontBold = fontRegular
		}

		if fontRegular != "" {
			log.Printf("[PDF] fonts ready (embedded): regular=%s bold=%s gofpdfDir=%s",
				fontRegular, fontBold, gofpdfFontDir)
			return
		}
	}

	// Запасной вариант: системные шрифты.
	for _, c := range systemFontCandidates {
		if _, err := os.Stat(c.regular); err == nil {
			fontRegular = c.regular
			if _, err2 := os.Stat(c.bold); err2 == nil {
				fontBold = c.bold
			} else {
				fontBold = c.regular
			}
			log.Printf("[PDF] fonts ready (system): regular=%s bold=%s gofpdfDir=%s",
				fontRegular, fontBold, gofpdfFontDir)
			return
		}
	}

	log.Printf("[PDF] WARNING: Cyrillic font not found; build with -tags with_fonts or install font-dejavu")
}
