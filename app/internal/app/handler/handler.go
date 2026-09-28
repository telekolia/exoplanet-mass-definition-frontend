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

func (h *Handler) GetTelescopeTile(ctx *gin.Context) {
	var telescopes []repository.Telescope
	var err error

	minLatitude := -90.0
	maxLatitude := 90.0

	if v := ctx.Query("min"); v != "" {
		if parsed, e := strconv.ParseFloat(v, 64); e == nil {
			minLatitude = parsed
		}
	}
	if v := ctx.Query("max"); v != "" {
		if parsed, e := strconv.ParseFloat(v, 64); e == nil {
			maxLatitude = parsed
		}
	}

	telescopes, err = h.Repository.GetTelescopesByLatitudeRange(minLatitude, maxLatitude)
	if err != nil {
		logrus.Error(err)
	}

	ctx.HTML(http.StatusOK, "telescope-tile.html", gin.H{
		"telescopes": telescopes,
		"min":        minLatitude,
		"max":        maxLatitude,
	})
}

func (h *Handler) GetTelescopeFeed(ctx *gin.Context) {
	telescopes, err := h.Repository.GetTelescopes()
	if err != nil || len(telescopes) == 0 {
		logrus.Error(err)
		ctx.String(http.StatusInternalServerError, "нет данных")
		return
	}

	currentID := 0
	if v := ctx.Query("id"); v != "" {
		if parsed, e := strconv.Atoi(v); e == nil {
			currentID = parsed
		}
	}

	var current repository.Telescope
	found := false
	for _, t := range telescopes {
		if t.ID == currentID {
			current = t
			found = true
			break
		}
	}
	if !found {
		current = telescopes[0]
	}

	nextID := 0
	minID := 0
	for i, t := range telescopes {
		if i == 0 || t.ID < minID {
			minID = t.ID
		}
		if t.ID > current.ID {
			if nextID == 0 || t.ID < nextID {
				nextID = t.ID
			}
		}
	}

	if nextID == 0 {
		nextID = minID
	}

	ctx.HTML(http.StatusOK, "telescope-feed.html", gin.H{
		"telescope": current,
		"next":      nextID,
	})
}

func (h *Handler) GetTelescopeDraft(ctx *gin.Context) {
	telescope, err := h.Repository.GetTelescope(1)
	if err != nil {
		ctx.String(http.StatusNotFound, err.Error())
		return
	}

	ctx.HTML(http.StatusOK, "telescope-draft.html", gin.H{"telescope": telescope})
}
