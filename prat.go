package main

import (
	"net/http"
	"github.com/gorilla/pat"
	"github.com/cespare/go-apachelog"
	"log"
	"os"
)

const (
	staticDir = "static"
	listenAddr = "localhost:5000"
)

func main() {
	mux := pat.New()

	staticPath := "/" + staticDir + "/"
	fileServer := http.FileServer(http.Dir(staticDir))
	for _, method := range []string{"GET", "HEAD"} {
		mux.Add(method, "/favicon.ico", fileServer)
		mux.Add(method, staticPath, http.StripPrefix(staticPath, fileServer))
	}

	mux.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello!"))
	})

	handler := apachelog.NewHandler(mux, os.Stderr)
	server := &http.Server{
		Addr: listenAddr,
		Handler: handler,
	}
	log.Println("Now listening on:", listenAddr)
	log.Fatal(server.ListenAndServe().Error())
}
