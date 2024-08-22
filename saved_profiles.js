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
    console.log('download-csv-btn')
    chrome.storage.local.get({ profiles: [] }, function(result) {
        console.log('Inside button click of download-csv-btn');
        const profiles = result.profiles || [];
        console.log('profiles ',profiles);
        const csvRows = [
            ['#', 'Name', 'Profile URL', 'Title']
        ];

        profiles.forEach((profile, index) => {
            const row = [index + 1, profile.name, profile.profileUrl, profile.title];
            csvRows.push(row);
        });

        const csvContent = csvRows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'linkedin_profiles.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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