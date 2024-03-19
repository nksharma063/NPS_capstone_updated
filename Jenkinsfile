pipeline {
    agent any  

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO_URL = 'https://gallery.ecr.aws/q7l6v7e1'
        ECR_REGISTRY = 'public.ecr.aws/q7l6v7e1/nps'
    }

    stages {
        stage('Build and push NPS push to the ECR') {
            steps {
                script {
                    git branch: 'main', url: 'https://github.com/sayanalokesh/NPS_capstone_updated.git'
                    // Prompt user for password
                    def userInput = input(
                        id: 'passwordInput', 
                        message: 'Enter your password', 
                        parameters: [string(defaultValue: '', description: '', name: 'password')]
                    )
                    // Use the provided password with docker-compose
                    sh "echo '${userInput}' | sudo -S docker-compose build"
                    sh 'sudo docker-compose up -d'
                    sh '''
                        grep -oP "image: \\K.*" docker-compose.yml | xargs -I {} sudo docker push {}
                    '''
                }
            }
        }
    }
}


// pipeline {
//     agent any  

//     environment {
//         AWS_REGION = 'ap-south-1'
//         ECR_REPO_URL = 'https://gallery.ecr.aws/q7l6v7e1'
//         ECR_REGISTRY = 'public.ecr.aws/q7l6v7e1/nps'
//     }

//     stages {
//         stage('Build and push NPS push to the ECR') {
//             steps {
//                 script {
//                     git branch: 'main', url: 'https://github.com/sayanalokesh/NPS_capstone_updated.git'
//                     // , credentialsId: 'gitAutoDeployToken'
//                     // sh "${WORKSPACE}/SampleMERNwithMicroservices/"
//                     sh 'whoami'
//                     sh 'echo "53e8643e7c624791abd8a46ae3f185b8" | sudo -S docker-compose build'
//                     // sh 'sudo docker-compose build'
//                     sh 'sudo docker-compose up -d'
//                     // sh 'docker build -t helloworld-image .'
//                     // withCredentials([usernamePassword(credentialsId: 'ecr_docker_creds', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
//                     //     // sh "aws ecr get-login-password --region ${AWS_REGION} | sudo docker login --username AWS --password-stdin ${ECR_REPO_URL}"
//                     sh '''
//                         grep -oP "image: \\K.*" docker-compose.yml | xargs -I {} sudo docker push {}
//                     '''
//                     // }
                    
//                     // sh 'docker tag helloworld-image:latest ${ECR_REPO_URL}/helloworld-image:latest'
                  
//                 }
//             }
//         }
//     }
// }