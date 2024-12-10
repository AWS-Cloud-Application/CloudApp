module.exports = {
    port: 8125,
    backends: ["statsd-cloudwatch-backend"],
    cloudwatch: {
        namespace: "MyApp",
        region: "us-east-2"
    }
};
