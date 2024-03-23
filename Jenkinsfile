pipeline {
    agent any  

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO_URL = 'https://gallery.ecr.aws/s7f2n3x3'
        ECR_REGISTRY = 'public.ecr.aws/s7f2n3x3/nps'
    }

    stages {
        stage('Build and push NPS push to the ECR') {
            steps {
                script {
                    git branch: 'main', url: 'https://github.com/sayanalokesh/NPS_capstone_updated.git'            
                    sh 'ls'
                    sh 'whoami'
                    sh 'sudo -S docker-compose build'
                    sh 'grep -oP "image: \\K.*" docker-compose.yml | xargs -I {} sudo docker push {}'
                    sh 'docker tag helloworld-image:latest ${ECR_REPO_URL}/helloworld-image:latest'
                    sh 'docker push ${ECR_REPO_URL}/helloworld-image:latest'
                }
            }
        }
    }
}
