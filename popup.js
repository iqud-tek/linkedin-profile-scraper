// Load saved profiles from local storage and display them
chrome.storage.local.get({ profiles: [] }, function (result) {
    const profilesContainer = document.getElementById('profiles');
    const profiles = result.profiles || [];

    profiles.forEach((profile) => {
        const profileDiv = document.createElement('div');
        profileDiv.classList.add('profile');

        const name = document.createElement('h2');
        name.innerText = profile.name;

        const title = document.createElement('p');
        title.innerText = profile.title;

        const link = document.createElement('a');
        link.href = profile.profileUrl;
        link.target = '_blank';
        link.innerText = 'View Profile';

        profileDiv.appendChild(name);
        profileDiv.appendChild(title);
        profileDiv.appendChild(link);

        profilesContainer.appendChild(profileDiv);
    });
});