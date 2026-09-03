pipeline {
    agent { label "dev" }

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

                sh "docker build -t node-k8s:v1.0.0 ."
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

                    sh "docker image tag node-k8:v1.0.0 ${env.dockerHubUser}/node-k8:v1.0.0"

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

    post {

        success {
            script {
                emailext(
                    from: 'cutilicious1947@gmail.com',
                    to: 'rkkhan0750@gmail.com',
                    subject: "SUCCESS: Node App CI/CD Pipeline - Build #${BUILD_NUMBER}",
                    body: """
Hello,

The Node App CI/CD pipeline has completed successfully.

Build Details:
------------------------------
Project     : Node App
Build No.   : #${BUILD_NUMBER}
Status      : SUCCESS
Branch      : ${env.GIT_BRANCH}
Commit      : ${env.GIT_COMMIT}
Job         : ${env.JOB_NAME}
Build URL   : ${env.BUILD_URL}

The application was successfully built, tested, pushed to Docker Hub,
and deployed successfully.

Regards,
Jenkins CI/CD Pipeline
""".stripIndent()
                )
            }
        }

        failure {
            script {
                emailext(
                    from: 'cutilicious1947@gmail.com',
                    to: 'rkkhan0750@gmail.com',
                    subject: 'Build Failure - Node App CI/CD',
                    body: 'Build failed for Node App CI/CD Pipeline. Please check the Jenkins console output.'
                )
            }
        }
    }
}