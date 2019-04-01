# Data Visualization

This Web-based 3D Earth Weather Simulation System will use National Weather Service(NWS), NASA, National Hurricane Center(NHC) data, such like radar cloud, hurricane and storm as the data source to demonstrate and visualize weather data in this system. 

## Deployment
```sh
docker stop PREVIOUS-CONTAINER
docker rm CONTAINER-NAME
docker build -t IMAGE-NAME .
docker run --name CONTAINER-NAME -p 80:8080 -d IMAGE-NAME
```
Clean images
```sh
docker system prune -a
```
