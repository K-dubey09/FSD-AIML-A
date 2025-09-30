var url="https://api.github.com/users/k-dubey09";
const resp=fetch(url);
console.log(resp);
    resp.then((data)=>{
        return data.json();
    })
    .then((data)=>{
        console.log(data);
    })
    .catch((err)=>{
        console.log(err);
    })
    .finally(()=>{
        console.log("done");
    })


 
      var   url = "https://api.github.com/users/k-dubey09";

        fetch(url)
            .then(response => {
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error(`GitHub API returned an error: ${response.status}`);
                }
                // Parse the JSON data and return a new promise
                return response.json();
            })
            .then(data => {
                // Use the successfully parsed JSON data to update the DOM
                document.getElementById("data").innerHTML = `
                    
                        <img src="${data.avatar_url}" alt="logo">
                        <h2>${data.name}</h2>
                        <p>${data.bio}</p>
                `;
            })
            .catch(err => {
                // Handle any network or parsing errors
                console.error(err);
                document.getElementById("data").innerHTML = `<p>Error loading data: ${err.message}</p>`;
            })
            .finally(() => {
                console.log("Fetch operation finished.");
            }); 
      
