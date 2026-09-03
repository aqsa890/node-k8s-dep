pipeline {
    agent any

    stages {

        stage("Cloning/Pulling Stage") {
            steps {
                echo "Cloning code"

                git url: "https://github.com/aqsa890/node-k8s-dep.git",
                    branch: "main"
            }
        }

        stage("Build") {
            steps {
                echo "Building the Node-app from Dockerfile"

                sh "docker build -t elsa888/node-k8s:v1.0.0 ."
            }
        }

        stage("Test") {
            steps {
                echo "Testing"
            }
        }

        stage("Push to Docker HUB") {
            steps {
                echo "Pushing image"

                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerCreds",
                        passwordVariable: "dockerHubPass",
                        usernameVariable: "dockerHubUser" 
                    )
                ]) {

                    sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPass}"

                    sh "docker image tag elsa888/node-k8:v1.0.0 ${env.dockerHubUser}/node-k8:v1.0.0"

                    sh "docker push ${env.dockerHubUser}/node-k8:v1.0.0"
                }
            }
        }

        stage("Deploy") {
            steps {
                echo "Deploying via Kubernetes Plugin..."

                sh "kubectl apply -f ./k8s/"
                sh "kubectl rollout status deployment/node-k8s-app -n node-k8s"
            }
        }
    }
}
