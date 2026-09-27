package api

import (
	"app/internal/app/handler"
	"app/internal/app/repository"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func StartServer() {
	log.Println("Starting server")

	repo, err := repository.NewRepository()
	if err != nil {
		logrus.Error("ошибка инициализации репозитория")
	}

	handler := handler.NewHandler(repo)

	r := gin.Default()
	r.LoadHTMLGlob("templates/*")
	r.Static("/static", "./resources")

	r.GET("/telescope-feed", handler.GetTelescopeFeed)
	r.GET("/telescope-tile", handler.GetTelescopeTiles)

	r.Run()
	log.Println("Server down")
}
