package main

import (
	"app/internal/app/config"
	"app/internal/app/dsn"
	"app/internal/app/handler"
	"app/internal/app/repository"
	"app/internal/pkg"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func main() {
	router := gin.Default()
	conf, err := config.NewConfig()
	if err != nil {
		logrus.Fatalf("error loading config: %v", err)
	}

	postgresString := dsn.FromEnv()
	useSSL := false
	if value := os.Getenv("MINIO_SECURE"); value != "" {
		useSSL, err = strconv.ParseBool(value)
		if err != nil {
			logrus.Fatal("MINIO_SECURE must be true or false")
		}
	}

	rep, errRep := repository.New(&repository.RepositorySettings{
		PostgresDSN:     postgresString,
		MinioEndpoint:   os.Getenv("MINIO_ENDPOINT"),
		MinioAccessKey:  os.Getenv("MINIO_ACCESS_KEY"),
		MinioSecretKey:  os.Getenv("MINIO_SECRET_KEY"),
		MinioBucketName: os.Getenv("MINIO_BUCKET_NAME"),
		MinioSecure:     useSSL,
	})
	if errRep != nil {
		logrus.Fatalf("error initializing repository: %v", errRep)
	}

	hand := handler.NewHandler(rep)

	application := pkg.NewApp(conf, router, hand)
	application.RunApp()
}
