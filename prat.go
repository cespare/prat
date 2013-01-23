package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("hi.")
	for {
		time.Sleep(1 * time.Minute)
	}
}
