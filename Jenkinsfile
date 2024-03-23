pipeline {
    agent any  

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO_URL = 'public.ecr.aws/s7f2n3x3/npsfrontend'
        ECR_REGISTRY = 'public.ecr.aws/s7f2n3x3/npsfrontend'
    }

    stages {
        stage('Build Image') {
            steps {
                script {
                    git branch: 'main', url: 'https://github.com/sayanalokesh/NPS_capstone_updated.git'            
                    sh 'ls'
                    sh 'whoami'
                    sh 'sudo -S docker-compose build'                    
                }
            }
        }
        
        stage('Push the FE image to the ECR') {
            steps {
                script {                    
                    sh 'grep -oP "image: \\K.*" docker-compose.yml | xargs -I {} sudo docker push {}'
                    sh 'docker tag nps_pipeline_lan_frontend:latest ${ECR_REPO_URL}/npsfrontend1:latest'
                    sh 'docker push ${ECR_REPO_URL}/npsfrontend1:latest'
                }
            }
        }
    }
}


// pipeline {
//     agent any  

//     environment {
//         AWS_REGION = 'ap-south-1'
//         ECR_REPO_URL = 'https://gallery.ecr.aws/s7f2n3x3'
//         ECR_REGISTRY = 'public.ecr.aws/s7f2n3x3/npsfrontend'
//     }

//     stages {
//         stage('Build Image') {
//             steps {
//                 script {
//                     git branch: 'main', url: 'https://github.com/sayanalokesh/NPS_capstone_updated.git'            
//                     sh 'ls'
//                     sh 'whoami'
//                     sh 'sudo -S docker-compose build'                    
//                 }
//             }
//         }
//     }

//         stage('Push the FE image to the ECR') {
//             steps {
//                 script {                    
//                     sh 'grep -oP "image: \\K.*" docker-compose.yml | xargs -I {} sudo docker push {}'
//                     sh 'docker tag nps_pipeline_lan_frontend:latest ${ECR_REPO_URL}/npsfrontend1:latest'
//                     sh 'docker push ${ECR_REPO_URL}/npsfrontend1:latest'
//                 }
//             }
//         }
// }
