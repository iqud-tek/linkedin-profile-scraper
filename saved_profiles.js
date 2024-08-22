// Function to load profiles from local storage and populate the table
function loadProfiles() {
    chrome.storage.local.get({ profiles: [] }, function(result) {
        const profiles = result.profiles || [];
        const profilesBody = document.getElementById('profiles-body');

        // Clear previous table rows
        profilesBody.innerHTML = '';

        if (profiles.length === 0) {
            profilesBody.innerHTML = '<tr><td colspan="4" class="text-center">No profiles saved yet.</td></tr>';
        } else {
            profiles.forEach((profile, index) => {
                const cleanUrl = profile.profileUrl.split('?')[0]; // Remove URL parameters

                const row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row">${index + 1}</th>
                    <td>${profile.name}</td>
                    <td><a href="${cleanUrl}" target="_blank">${cleanUrl}</a></td>
                    <td>${profile.title}</td>
                `;

                profilesBody.appendChild(row);
            });
        }

        // Scroll to the bottom of the page
        window.scrollTo(0, document.body.scrollHeight);
    });
}

// Event listener for the refresh button
document.getElementById('refresh-btn').addEventListener('click', function() {
    loadProfiles();
});

// Event listener for the clear data button with confirmation
document.getElementById('clear-data-btn').addEventListener('click', function() {
    const confirmed = confirm('Are you sure you want to clear all saved profile data?');
    if (confirmed) {
        chrome.storage.local.set({ profiles: [] }, function() {
            alert('All profiles cleared.');
            loadProfiles();
        });
    }
});

// Event listener for the download CSV button
document.getElementById('download-csv-btn').addEventListener('click', function() {
    chrome.storage.local.get({ profiles: [] }, function(result) {
        const profiles = result.profiles || [];
        if (profiles.length === 0) {
            alert('No profiles to download.');
            return;
        }

        // Prepare CSV data
        let csvContent = 'data:text/csv;charset=utf-8,#,Name,Profile URL,Title\n';

        profiles.forEach((profile, index) => {
            const cleanUrl = profile.profileUrl.split('?')[0]; // Remove URL parameters
            const csvRow = `${index + 1},"${profile.name}","${cleanUrl}","${profile.title}"\n`;
            csvContent += csvRow;
        });

        // Encode CSV content and create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'saved_profiles.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

// Function to refresh page when the tab is focused
window.addEventListener('focus', function() {
    loadProfiles();
});

// Load profiles when the page is first loaded
window.onload = function() {
    loadProfiles();
};