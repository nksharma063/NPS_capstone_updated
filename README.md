# NPS

NPS Tool


## Containerizing Applications

Build Image:
```sh
docker build . -t imagename:version
```

Executing image:
```sh
docker run -p localport:containerport -d imagename:version
```

Note: `-d` will execute the image in the background<br/>

Checking out running container:
```sh
docker ps
```

Stopping docker:
```sh
docker stop containerId
```


## Microservices

1. Basic Service APIs
    - Domain Collections
        - ~~Add domain~~
        - ~~Get domain~~
        - ~~Get domain by Id~~
        - ~~Update domain~~
        - ~~Delete domain~~
    - Program Collections
        - ~~Add Program~~
        - ~~Get Program~~
        - ~~Get Program by Id~~
        - ~~Update Program~~
        - ~~Delete Program~~
    - Batch Collections
        - ~~Add Batch~~
        - ~~Get Batch~~
        - ~~Get Batch by Id~~
        - ~~Update Batch~~
        - ~~Delete Batch~~
    - Health
        - ~~Get Health~~

2. 