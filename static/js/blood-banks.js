document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const resultsContainer = document.getElementById('results-container');
    const noResults = document.getElementById('no-results');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-spinner';
    loadingIndicator.innerHTML = '<p>Searching blood banks...</p>';

    // Search function
    searchBtn.addEventListener('click', function() {
        // Reset UI
        noResults.style.display = 'none';
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(loadingIndicator);
        
        // Get and validate input
        const city = cityInput.value.trim();
        if (!city) {
            resultsContainer.removeChild(loadingIndicator);
            alert('Please enter a city name');
            return;
        }

        // API Request
        fetch('http://localhost:5000/search-blood-banks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `city=${encodeURIComponent(city)}`
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { 
                    throw new Error(err.error || 'Server error');
                });
            }
            return response.json();
        })
        .then(data => {
            // Process results
            resultsContainer.removeChild(loadingIndicator);
            
            if (!data || data.length === 0) {
                noResults.style.display = 'block';
                return;
            }

            // Display results
            data.forEach(bank => {
                const card = document.createElement('div');
                card.className = 'blood-bank-card';
                card.innerHTML = `
                    <h3>${bank['Blood Bank Name'] || 'N/A'}</h3>
                    <p><strong>Address:</strong> ${bank['Address'] || 'N/A'}</p>
                    <p><strong>City:</strong> ${bank['City'] || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${bank['Contact'] || 'N/A'}</p>
                `;
                resultsContainer.appendChild(card);
            });
        })
        .catch(error => {
            // Error handling
            resultsContainer.removeChild(loadingIndicator);
            console.error("Error:", error);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <p class="text-danger">Error: ${error.message}</p>
                <p>Please check:</p>
                <ul>
                    <li>Flask server is running</li>
                    <li>Internet connection</li>
                    <li>Valid city name</li>
                </ul>
            `;
            resultsContainer.appendChild(errorDiv);
        });
    });
});