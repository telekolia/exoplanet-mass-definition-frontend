package repository

import (
	"app/internal/app/media"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"mime/multipart"
	"net/url"

	"github.com/minio/minio-go/v7"
)

func (r *Repository) uploadTelescopeMedia(ctx context.Context, telescopeID uint, kind string, header *multipart.FileHeader) (string, error) {
	contentType, extension, err := media.ValidateFileUpload(header, kind)
	if err != nil {
		return "", err
	}
	file, err := header.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()
	var random [16]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", err
	}
	filename := fmt.Sprintf("telescope-%d-%s-%s%s", telescopeID, kind, hex.EncodeToString(random[:]), extension)
	_, err = r.minio.PutObject(ctx, r.minioBucketName, filename, file, header.Size, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", fmt.Errorf("загрузка %s в MinIO: %w", kind, err)
	}
	return filename, nil
}

func (r *Repository) removeTelescopeMedia(ctx context.Context, name string) error {
	return r.minio.RemoveObject(ctx, r.minioBucketName, name, minio.RemoveObjectOptions{})
}

func (r *Repository) MediaURL(name string) string {
	if name == "" {
		return ""
	}
	if parsed, err := url.Parse(name); err == nil && parsed.Host != "" && (parsed.Scheme == "http" || parsed.Scheme == "https") {
		return name
	}
	return r.minio.EndpointURL().String() + "/" + r.minioBucketName + "/" + url.PathEscape(name)
}
