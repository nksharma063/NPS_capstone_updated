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

### Environment 
  We created three environments using fork
     Prashant : Main environment which will execute the code in production
     Lokesh, Neeraj and Ajay Forked code and pipeline will be considere as Dev ------ Staging ---- Beta

### Docker Compose 
We have tested services on different ports using docker-compose up command to run the containers.
We have verified that all services are working fine on ports 3000 to 3008
  docker compose up
  docker compose up --watch //Observer teh behaviour of the aplication and implement new features and testing it without building the image again.
  https://docs.docker.com/compose/gettingstarted/#step-4-edit-the-compose-file-to-use-compose-watch


### Building, Pushing the files to repository using jenkins once testing is completed using 

                    ###### Composing the file
                    git branch: 'main', url: 'https://github.com/sayanalokesh/NPS_capstone_updated.git'            
                    sh 'ls'
                    sh 'whoami'
                    sh 'sudo -S docker-compose build'                    
                    sh "aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ECR_REGISTRY}"                      
                         ##### Pushing the front image to ecr repoitory
                         sh "aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ECR_REGISTRY}"                                          
                        // sh 'grep -oP "image: \\K.*" docker-compose.yml | xargs -I {} sudo docker push {}'
                        sh 'docker tag nps_pipeline_lan_frontend:latest ${ECR_REGISTRY}/npsfrontend:latest'
                        sh 'docker push ${ECR_REGISTRY}/npsfrontend:latest
                        Pushing the backend images to ECR repostiry
                        sh 'docker tag nps_pipeline_lan_userdataservice:latest ${ECR_REGISTRY}/userdataservice:latest'
                        sh 'docker tag nps_pipeline_lan_nps:latest ${ECR_REGISTRY}/nps1:latest'
                        sh 'docker tag nps_pipeline_lan_calculationservice:latest ${ECR_REGISTRY}/calculationservice:latest'
                        sh 'docker tag nps_pipeline_lan_baseservice:latest ${ECR_REGISTRY}/baseservice:latest'
                        sh 'docker tag nps_pipeline_lan_authservice:latest ${ECR_REGISTRY}/authservice:latest'
                        sh 'docker push ${ECR_REGISTRY}/userdataservice:latest'
                        sh 'docker push ${ECR_REGISTRY}/nps1:latest'
                        sh 'docker push ${ECR_REGISTRY}/calculationservice:latest'
                        sh 'docker push ${ECR_REGISTRY}/baseservice:latest'
                        sh 'docker push ${ECR_REGISTRY}/authservice:latest'


We have authenticated teh credentials, we have also build the tagging with three microsorvices for the rollback strategy in case for any disaster, through different running versions locally, due to limitation constraint on aws, we just tested with latest tag images on cloud.

   

#
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
