// https://console.cloud.google.com/
module.exports = {
  web: {
    client_id: "...",
    client_secret: "...",
    redirect_uris: ["http://localhost:8080/api/v1/auth/google/callback"],
  },
};

// https://github.com/settings/applications/new
module.exports.github = {
  client_id: "...",
  client_secret: "...",
};
