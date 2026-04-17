//go:build with_fonts

package utils

import _ "embed"

//go:embed pdffonts/DejaVuSans.ttf
var fontBytesRegular []byte

//go:embed pdffonts/DejaVuSans-Bold.ttf
var fontBytesBold []byte
