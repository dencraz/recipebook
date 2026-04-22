FROM golang:1.22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache font-dejavu

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Найти DejaVu и вложить байты в бинарник через go:embed (-tags with_fonts).
RUN set -e; \
    REGULAR=$(find /usr/share/fonts -name "DejaVuSans.ttf" | head -1); \
    BOLD=$(find /usr/share/fonts -name "DejaVuSans-Bold.ttf" | head -1); \
    if [ -z "$REGULAR" ]; then echo "ERROR: DejaVuSans.ttf not found"; exit 1; fi; \
    [ -z "$BOLD" ] && BOLD="$REGULAR"; \
    mkdir -p internal/utils/pdffonts; \
    cp "$REGULAR" internal/utils/pdffonts/DejaVuSans.ttf; \
    cp "$BOLD"    internal/utils/pdffonts/DejaVuSans-Bold.ttf; \
    echo "Fonts: regular=$REGULAR bold=$BOLD"

RUN CGO_ENABLED=0 GOOS=linux go build -tags with_fonts -o server ./cmd/server

# ── runtime image ──────────────────────────────────────────────────────────────
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8000
CMD ["./server"]
