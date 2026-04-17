package utils

import (
	"log"
	"os"
	"sync"
)

var (
	fontOnce    sync.Once
	fontRegular string
	fontBold    string
)

func ensureFonts() {
	fontOnce.Do(func() {
		if len(fontBytesRegular) == 0 {
			log.Printf("[PDF] no font embedded; build with -tags with_fonts for Cyrillic support")
			return
		}

		r, err := os.CreateTemp("", "pdf_font_*.ttf")
		if err != nil {
			log.Printf("[PDF] cannot create temp font file: %v", err)
			return
		}
		if _, err = r.Write(fontBytesRegular); err != nil {
			log.Printf("[PDF] cannot write font: %v", err)
			r.Close()
			return
		}
		r.Close()
		fontRegular = r.Name()

		if len(fontBytesBold) > 0 {
			b, err := os.CreateTemp("", "pdf_font_bold_*.ttf")
			if err == nil {
				b.Write(fontBytesBold)
				b.Close()
				fontBold = b.Name()
			}
		}

		log.Printf("[PDF] fonts ready: regular=%s bold=%s", fontRegular, fontBold)
	})
}
