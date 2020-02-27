// can't use auto mocks because Jest gives: "ReferenceError: define is not defined error"

const ApplicationInsights = jest.genMockFromModule("@microsoft/applicationinsights-web");
module.exports = ApplicationInsights;
