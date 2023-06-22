const API = 'https://github-repo-creator-api.onrender.com';

// Function to handle the authorization status
function handleAuthorizationStatus(authorized) {
  const authorizeBtn = document.getElementById('authorizeBtn');
  const createRepoBtn = document.getElementById('createRepoBtn');
  const uploadFileBtn = document.getElementById('uploadFileBtn');

  if (authorized) {
    authorizeBtn.textContent = 'Authorized';
    authorizeBtn.classList.remove('btn-primary');
    authorizeBtn.classList.add('btn-success');
    authorizeBtn.disabled = true;
    createRepoBtn.disabled = false;
    uploadFileBtn.disabled = false;
  } else {
    authorizeBtn.textContent = 'Authorize with Github';
    authorizeBtn.classList.remove('btn-success');
    authorizeBtn.classList.add('btn-primary');
    authorizeBtn.disabled = false;
    createRepoBtn.disabled = true;
    uploadFileBtn.disabled = true;
  }
}

function showMessage(message, color) {
  const successMessage = document.getElementById('successMessage');
  successMessage.textContent = message;
  successMessage.style.color = color;
}

document.getElementById('authorizeBtn').addEventListener('click', () => {
  window.location.href =
    API + '/github/auth/callback';
});

document
  .getElementById('createRepoForm')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    const repoName = document.getElementById('repoNameInput').value;
    if (repoName) {
      fetch(
        API + '/github/create-repo',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ repoName }),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          showMessage(data.message, 'green');
        })
        .catch((error) => {
          showMessage(error.message, 'red');
        });
    }
  });

document.getElementById('uploadFileBtn').addEventListener('click', () => {
  event.preventDefault();
  fetch(
    API + '/github/upload-files',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )
  .then((response) => response.json())
  .then((data) => {
    showMessage(data.message, 'green');
  })
  .catch((error) => {
    showMessage(error.message, 'red');
  });
});


// Check authorization status on page load
fetch(
  API + '/github/check-auth',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  },
)
.then((response) => response.json())
.then((authData) => {
  handleAuthorizationStatus(authData.authorized);
})
.catch((error) => {
  showMessage(error.message, 'red');
});
