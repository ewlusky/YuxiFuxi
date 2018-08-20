class apiManager {
  getField(resource) {
    return fetch(`http://localhost:5002/${resource}`).then(e => e.json());
  }

  postUser(name, password) {
    let now = Date.now()
    let day = new Date(now)
    return fetch("http://localhost:5002/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        password: password,
        url: "",
        time: 0,
        percent: 0,
        last: day.getDate(),
      })
    }).then(e => e.json());
  }

  patchUser(id, url, time, percent) {   //
    let now = Date.now()
    let day = new Date(now)
    return fetch(`http://localhost:5002/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url,
        time: time,
        last: day.getDate(),
        percent: percent
      })
    }).then(e => e.json());
  }

  postWord(word) {
    return fetch("http://localhost:5002/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...word })
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
        wordId: wordId,
        count: 1
      })
    }).then(e => e.json());
  }

  putWordUser(id, wordId, count) {
    return fetch(`http://localhost:5002/wordusers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: sessionStorage.getItem('UserId'),
        wordId: wordId,
        count: count
      })
    }).then(e => e.json());
  }

  postRecord() {
    return fetch("http://localhost:5002/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: sessionStorage.getItem('UserId'),
        record: [0]
      })
    }).then(e => e.json());
  }

  putRecord(id, record) {
    return fetch(`http://localhost:5002/records/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: sessionStorage.getItem('UserId'),
        record: record
      })
    }).then(e => e.json());
  }



}

const API = new apiManager();
export default API;
