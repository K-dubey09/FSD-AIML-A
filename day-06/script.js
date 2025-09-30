function fetchData() {
    const url = "https://dummyjson.com/recipes";
    
    // Show loading message
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            let tableData = "";
            
            data.recipes.forEach(recipe => {
                tableData += `<tr>
                    <td>${recipe.id}</td>
                    <td>${recipe.name}</td>
                    <td><img src="${recipe.image}" alt="${recipe.name}" style="max-width: 100px;"></td>
                    <td>${recipe.rating}</td>
                    <td>
                </tr>`;
            });
            
            tableBody.innerHTML = tableData;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = '<tr><td colspan="5">Error loading data. Please try again.</td></tr>';
        });
}
document.getElementById("fetchDataBtn").addEventListener("click", fetchData);