package handler

import (
	"app/internal/app/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	Repository *repository.Repository
}

func NewHandler(r *repository.Repository) *Handler {
	return &Handler{
		Repository: r,
	}
}

func (h *Handler) GetTile(ctx *gin.Context) {
	var telescopes []repository.Telescope
	var err error

	minCost := 0
	maxCost := 100000

	if v := ctx.Query("min"); v != "" {
		if parsed, e := strconv.Atoi(v); e == nil {
			minCost = parsed
		}
	}
	if v := ctx.Query("max"); v != "" {
		if parsed, e := strconv.Atoi(v); e == nil {
			maxCost = parsed
		}
	}

	telescopes, err = h.Repository.GetTelescopesByCostRange(minCost, maxCost)
	if err != nil {
		logrus.Error(err)
	}

	ctx.HTML(http.StatusOK, "tile.html", gin.H{
		"telescopes": telescopes,
		"min":        minCost,
		"max":        maxCost,
	})
}
