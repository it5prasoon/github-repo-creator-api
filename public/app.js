document.getElementById('authorizeBtn').addEventListener('click', () => {
  window.location.href =
    'https://github-repo-creator-api.cyclic.app/github/auth/callback';
});

function showMessage(message, color) {
  const successMessage = document.getElementById('successMessage');
  successMessage.textContent = message;
  successMessage.style.color = color;
}

document
  .getElementById('createRepoForm')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    const repoName = document.getElementById('repoNameInput').value;
    if (repoName) {
      fetch(
        'https://github-repo-creator-api.cyclic.app/github/create-repo',
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
