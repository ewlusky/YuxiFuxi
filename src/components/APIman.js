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

      postWord(word) {
          return fetch("http://localhost:5002/words", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({...word})
        }).then(e => e.json());
      }

      postWordUser(wordId) {
        return fetch("http://localhost:5002/wordusers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: sessionStorage.getItem('UserId'),
          wordId: wordId
          })
      }).then(e => e.json());
    }


      
}

const API = new apiManager();
export default API;
