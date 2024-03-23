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
                    withCredentials([
                        [
                            $class: 'AmazonWebServicesCredentialsBinding',
                            accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                            credentialsId: '7b75a6d6-7f8e-42b6-840c-6182b4101b77', // ID of the AWS credentials in Jenkins
                            secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                        ]
                    ]) {
                        sh 'echo $AWS_ACCESS_KEY_ID'
                        sh "aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ECR_REPO_URL}"                                          
                        // sh 'grep -oP "image: \\K.*" docker-compose.yml | xargs -I {} sudo docker push {}'
                        sh 'docker tag nps_pipeline_lan_frontend:latest ${ECR_REPO_URL}/npsfrontend:latest'
                        sh 'docker push ${ECR_REPO_URL}/npsfrontend:latest'
                    }
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
