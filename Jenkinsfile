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

                sh "docker image inspect elsa888/node-k8s:v1.0.0"
            }
        }

        stage("Push to Docker HUB") {
            steps {
                echo "Pushing image"

                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerCreds",
                        usernameVariable: "dockerHubUser",
                        passwordVariable: "dockerHubPass"
                    )
                ]) {

                    sh '''
                        echo "$dockerHubPass" | docker login \
                            -u "$dockerHubUser" \
                            --password-stdin

                        docker tag \
                            elsa888/node-k8s:v1.0.0 \
                            "$dockerHubUser/node-k8s:v1.0.0"

                        docker push \
                            "$dockerHubUser/node-k8s:v1.0.0"
                    '''
                }
            }
        }

        stage("Deploy") {
            steps {
                echo "Deploying via Kubernetes Plugin..."

            sh '''
            kubectl apply -f ./k8s/namespace.yml
            kubectl apply -f ./k8s/deployment.yml
            kubectl apply -f ./k8s/service.yml

            kubectl rollout status deployment/node-k8s-app -n node-k8s

            echo "Starting port forwarding..."

            kubectl port-forward \
                svc/node-k8s-app \
                6767:6767 \
                -n node-k8s \
                > port-forward.log 2>&1 &

            PORT_FORWARD_PID=$!

            sleep 5

            echo "Testing application..."

            curl -f http://127.0.0.1:6767/health

            echo "Application is working!"

            kill $PORT_FORWARD_PID || true
        '''
            }
        }
    }
}
