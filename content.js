// Inject Bootstrap CSS into LinkedIn's page
const bootstrapLink = document.createElement('link');
bootstrapLink.rel = 'stylesheet';
bootstrapLink.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
document.head.appendChild(bootstrapLink);

// Function to inject copy buttons into feed, reactions modal, and votes modal
function injectCopyButtons() {
    // For profiles in the main feed
    const feedProfileContainers = document.querySelectorAll('.update-components-actor__container');

    feedProfileContainers.forEach((profileContainer) => {
        const profileImageWrapper = profileContainer.querySelector('.ivm-view-attr__img-wrapper');
        const profileLink = profileContainer.querySelector('a.app-aware-link');

        // Inject the button if not already added
        if (profileImageWrapper && profileLink && !profileContainer.querySelector('.copy-btn')) {
            const button = createCopyButton(profileContainer, profileLink.href);
            profileImageWrapper.style.display = 'flex';  // Ensure flex layout for positioning
            profileImageWrapper.prepend(button);
        }
    });

    // For profiles inside the reactions modal
    const modalProfileContainers = document.querySelectorAll('.social-details-reactors-tab-body-list-item');

    modalProfileContainers.forEach((profileContainer) => {
        const profileLink = profileContainer.querySelector('a.link-without-hover-state');

        // Inject the button if not already added
        if (profileLink && !profileContainer.querySelector('.copy-btn')) {
            const button = createCopyButton(profileContainer, profileLink.href);
            const imageWrapper = profileContainer.querySelector('.artdeco-entity-lockup__image');
            if (imageWrapper) {
                imageWrapper.style.display = 'flex';  // Ensure flex layout for positioning
                imageWrapper.prepend(button);
            }
        }
    });

    // For profiles inside the votes modal
    const votesModalProfileContainers = document.querySelectorAll('.update-components-poll-vote__item');

    votesModalProfileContainers.forEach((profileContainer) => {
        const profileLink = profileContainer.querySelector('a.update-components-poll-vote__profile-link');

        // Inject the button if not already added
        if (profileLink && !profileContainer.querySelector('.copy-btn')) {
            const button = createCopyButton(profileContainer, profileLink.href);
            const imageWrapper = profileContainer.querySelector('.ivm-image-view-model');
            if (imageWrapper) {
                imageWrapper.style.display = 'flex';  // Ensure flex layout for positioning
                imageWrapper.prepend(button);
            }
        }
    });

    // Inject the "Copy All Profiles" button into the votes modal near the "Votes" heading
    const votesModalHeader = document.querySelector('.update-components-voters-list-modal__header');
    if (votesModalHeader && !document.querySelector('.copy-all-btn-votes')) {
        const copyAllButtonVotes = document.createElement('button');
        copyAllButtonVotes.innerText = 'Copy All Profiles';
        copyAllButtonVotes.classList.add('btn', 'btn-primary', 'mr-3', 'copy-all-btn-votes');  // Bootstrap button styles

        // Add the button to the left of the "Votes" heading
        votesModalHeader.parentElement.insertBefore(copyAllButtonVotes, votesModalHeader.parentElement.firstChild);

        // Add the event listener to copy all profiles in the votes modal
        copyAllButtonVotes.addEventListener('click', function () {
            copyAllProfilesInVotesModal();
        });
    }
}

// Function to create a copy button for individual profiles
function createCopyButton(profileContainer, profileUrl) {
    const button = document.createElement('button');
    button.innerText = 'Copy Profile';
    button.classList.add('btn', 'btn-success', 'mr-2', 'copy-btn');

    const profileId = extractProfileId(profileUrl);
    button.onclick = function (event) {
        event.stopPropagation();
        event.preventDefault();
        extractProfileInfo(profileContainer, profileId, profileUrl);
    };

    return button;
}

// Function to extract individual profile information
function extractProfileInfo(profileElement, profileId, profileUrl) {
    const rawName = profileElement.querySelector('.update-components-actor__name, .artdeco-entity-lockup__title, .text-view-model')?.textContent.trim();
    const cleanName = cleanProfileName(rawName);
    const title = profileElement.querySelector('.update-components-actor__description, .artdeco-entity-lockup__caption, .t12.t-black--light.t-normal')?.textContent.trim() || '--';

    const profileData = {
        profileId,
        name: cleanName,
        title,
        profileUrl
    };

    saveProfileToLocalStorage(profileData);
}

function cleanProfileName(rawName) {
    // Remove any text after "View"
    if (rawName && rawName.includes('View')) {
        rawName = rawName.split('View')[0];
    }
console.log('rawName ',rawName);
    // Split the name into parts and keep only the first two (e.g., first name and last name)
    const nameParts = rawName.split(' '); // Split by whitespace
// console.log('nameParts ',nameParts);
    let cleanedName = nameParts[0];
    if(nameParts[1]){
        cleanedName =cleanedName.concat(' ',nameParts[1]);
    }
    return cleanedName;
}

// Function to save profile to local storage
function saveProfileToLocalStorage(profileData) {
    chrome.storage.local.get({ profiles: [] }, function (result) {
        const profiles = result.profiles || [];
        const isProfileExists = profiles.some(profile => profile.profileId === profileData.profileId);

        if (!isProfileExists) {
            profiles.push(profileData);
            chrome.storage.local.set({ profiles: profiles }, function () {
                console.log('Profile saved:', profileData);
            });
        } else {
            console.log('Profile already exists:', profileData);
        }
    });
}

// Function to copy all profiles in the votes modal
function copyAllProfilesInVotesModal() {
    const votesModalProfileContainers = document.querySelectorAll('.update-components-poll-vote__item');

    votesModalProfileContainers.forEach((profileContainer) => {
        const profileLink = profileContainer.querySelector('a.update-components-poll-vote__profile-link');
        const profileUrl = profileLink.href;
        const profileId = extractProfileId(profileUrl);

        extractProfileInfo(profileContainer, profileId, profileUrl);
    });

    alert('All profiles in Votes modal copied!');
}

// Updated function to extract the profile ID from LinkedIn URL with improved rules
function extractProfileId(url) {
    const cleanUrl = url.split('?')[0];
    const urlParts = cleanUrl.split('/');

    if (url.includes('/company/')) {
        const companyIdIndex = urlParts.indexOf('company') + 1;
        return urlParts[companyIdIndex];
    }

    if (url.includes('/in/')) {
        const profileIdIndex = urlParts.indexOf('in') + 1;
        return urlParts[profileIdIndex];
    }

    return urlParts[urlParts.length - 1];
}

// Observe for changes in the feed, reactions modal, and votes modal (infinite scroll or new profiles loaded)
window.addEventListener('load', function () {
    injectCopyButtons();

    const observer = new MutationObserver(injectCopyButtons);
    observer.observe(document.body, { childList: true, subtree: true });
});