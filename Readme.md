# Deepmind-v1

A Dockerized full-stack application with **Django backend** and **React frontend**, configured to run together.  

---

## Running the App

1. **Add the custom URL to your hosts file**

Edit `/etc/hosts` and add the following line:

```bash
127.0.0.1 dev.deepmind.tn
```

2. **Start the application**

From the project root, run:

```bash
make build up
```

This will build and start the backend, frontend, and Nginx reverse proxy.

2. **Access the app**

Open your browser and go to:

```bash
http://dev.deepmind.tn
```

The app should now be running and fully accessible through the custom URL.