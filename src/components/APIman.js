class apiManager {
  getField(resource) {
    return fetch(`http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/${resource}`).then(e => e.json());
  }

  postUser(name, password) {
    let now = Date.now()
    let day = new Date(now)
    return fetch("http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/users", {
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

  patchUser(id, url, time, percent) {   //ec2-18-220-80-235.us-east-2.compute.amazonaws.com
    let now = Date.now()
    let day = new Date(now)
    return fetch(`http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/users/${id}`, {
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
    return fetch("http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...word })
    }).then(e => e.json());
  }

  postWordUser(wordId) {
    return fetch("http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/wordusers", {
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
    return fetch(`http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/wordusers/${id}`, {
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
    return fetch("http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/records", {
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
    return fetch(`http://ec2-18-220-80-235.us-east-2.compute.amazonaws.com/records/${id}`, {
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
