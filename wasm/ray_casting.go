//go:build wasm
// +build wasm

package main

import (
	"encoding/hex"
	"math"
	"strconv"
	"syscall/js"
)

type Camera struct {
	x, y     float64
	angle    float64
	height   float64
	pitch    float64
	vel      float64
	angleVel float64
}

type Screen struct {
	width, height int
}

func (s Screen) DeltaAngle() float64 {
	return FOV / float64(s.width)
}

const (
	FOV          = math.Pi / 6
	RAY_DISTANCE = 2000
	SCALE_HEIGHT = 980
)

type result struct {
	index int
	value []int32
}

var camera = Camera{
	x:        0,
	y:        0,
	angle:    math.Pi / 4,
	pitch:    20,
	vel:      3,
	angleVel: 0.03,
}

var screen = Screen{width: 800, height: 450}

func must[T any](value T, err error) T {
	if err != nil {
		panic(err)
	}
	return value
}

func castRayNoCGo(
	index int,
	colorMap [][]string, heightMap [][]string,
	rayAngle float64,
	res chan<- result,
) {
	drawing := make([]int32, screen.height)
	sin, cos := math.Sincos(float64(rayAngle))
	smallestY := int(screen.height)

	for z := 1.0; z < RAY_DISTANCE; z++ {
		x := int(z*cos + float64(camera.x))
		if x < 0 || x >= len(heightMap) {
			continue
		}

		y := int(z*sin + float64(camera.y))
		if y < 0 || y >= len(heightMap[0]) {
			continue
		}

		// magic formula to remove fish eye
		depth := z * math.Cos(float64(camera.angle)-rayAngle)

		heightOnMap := must(hex.DecodeString(heightMap[x][y][:4]))
		heightOnScreen := int(float64(camera.height-float64(heightOnMap[0]))/depth*SCALE_HEIGHT + float64(camera.pitch))

		heightOnScreen = max(0, heightOnScreen)

		if heightOnScreen < smallestY {
			for screenY := heightOnScreen; screenY < smallestY; screenY++ {
				drawing[screenY] = int32(must(strconv.ParseInt(colorMap[x][y], 16, 32)))
			}
			smallestY = heightOnScreen
		}
	}
	res <- result{index, drawing}
}

func runRayCasting() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		res := make([][]int32, screen.width)
		data := make(chan result, screen.width)

		rayAngle := camera.angle - (FOV / 2)

	})
}
