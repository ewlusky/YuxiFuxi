class apiManager {
    getField(resource) {
      return fetch(`http://localhost:5002/${resource}`).then(e => e.json());
    }

    postUser(name, password) {
        return fetch("http://localhost:5002/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            password: password
          })
        }).then(e => e.json());
      }

      
}

const API = new apiManager();
export default API;
