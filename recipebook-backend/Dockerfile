FROM golang:1.22-alpine AS builder
WORKDIR /app
# Install fonts in builder so we can embed them into the binary
RUN apk add --no-cache font-dejavu
COPY go.mod ./
COPY . .
# Copy fonts AFTER COPY . . so they exist for //go:embed at compile time
RUN mkdir -p internal/utils/pdffonts && \
    cp /usr/share/fonts/dejavu/DejaVuSans.ttf      internal/utils/pdffonts/ && \
    cp /usr/share/fonts/dejavu/DejaVuSans-Bold.ttf internal/utils/pdffonts/
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -tags with_fonts -o server ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8000
CMD ["./server"]
