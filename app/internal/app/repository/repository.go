package repository

import (
	"errors"
	"fmt"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	ErrConflict  = errors.New("операция недопустима в текущем состоянии")
	ErrForbidden = errors.New("телескоп принадлежит другому пользователю")
)

type RepositorySettings struct {
	PostgresDSN     string
	MinioEndpoint   string
	MinioAccessKey  string
	MinioSecretKey  string
	MinioBucketName string
	MinioSecure     bool
}

type Repository struct {
	db              *gorm.DB
	minio           *minio.Client
	minioBucketName string
}

func New(settings *RepositorySettings) (*Repository, error) {
	if settings == nil || settings.PostgresDSN == "" {
		return nil, errors.New("не задано подключение PostgreSQL")
	}
	if settings.MinioEndpoint == "" || settings.MinioAccessKey == "" || settings.MinioSecretKey == "" || settings.MinioBucketName == "" {
		return nil, errors.New("задайте MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_NAME")
	}
	options := &minio.Options{
		Creds:  credentials.NewStaticV4(settings.MinioAccessKey, settings.MinioSecretKey, ""),
		Secure: settings.MinioSecure,
	}
	client, err := minio.New(settings.MinioEndpoint, options)
	if err != nil {
		return nil, fmt.Errorf("инициализация MinIO: %w", err)
	}
	db, err := gorm.Open(postgres.Open(settings.PostgresDSN), &gorm.Config{TranslateError: true})
	if err != nil {
		return nil, err
	}
	return &Repository{db: db, minio: client, minioBucketName: settings.MinioBucketName}, nil
}
