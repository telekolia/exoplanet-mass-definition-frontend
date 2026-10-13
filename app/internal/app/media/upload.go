package media

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

const (
	MaxImageSize   int64 = 5 << 20
	MaxVideoSize   int64 = 50 << 20
	MaxRequestSize int64 = 60 << 20
)

var ErrTooLarge = errors.New("превышен допустимый размер файла")

func ValidateFileUpload(header *multipart.FileHeader, kind string) (contentType, extension string, err error) {
	limit := MaxImageSize
	if kind == "video" {
		limit = MaxVideoSize
	}
	if header.Size <= 0 {
		return "", "", errors.New("файл пуст")
	}
	if header.Size > limit {
		return "", "", ErrTooLarge
	}
	file, err := header.Open()
	if err != nil {
		return "", "", fmt.Errorf("не удалось открыть файл: %w", err)
	}
	defer file.Close()
	buffer := make([]byte, 512)
	n, err := io.ReadFull(file, buffer)
	if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
		return "", "", fmt.Errorf("не удалось прочитать файл: %w", err)
	}
	contentType = http.DetectContentType(buffer[:n])
	imageTypes := map[string]string{"image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp"}
	videoTypes := map[string]string{"video/mp4": ".mp4", "video/webm": ".webm"}
	if kind == "image" {
		extension = imageTypes[contentType]
	} else if kind == "video" {
		extension = videoTypes[contentType]
	}
	if extension == "" {
		return "", "", fmt.Errorf("неподдерживаемый тип %s для поля %s", contentType, kind)
	}
	return contentType, extension, nil
}
