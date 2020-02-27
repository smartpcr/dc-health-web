###### Build
FROM xddevacr.azurecr.io/dotnet-2.1-sdk AS builder

# switch to root since we need to install node js.
USER root

# Install NodeJS
ENV NODE_VERSION 8.11.3
ENV NODE_DOWNLOAD_SHA 1ea408e9a467ed4571730e160993f67a100e8c347f6f9891c9a83350df2bf2be  
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" --output nodejs.tar.gz \
    && echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
    && tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
    && rm nodejs.tar.gz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# switch out to the dotnet user.
USER dotnet

# Copy everything
COPY --chown=dotnet . /build/

# switch to work directory.
WORKDIR /build

# build and restore
ARG CONFIGURATION
RUN dotnet restore src/
WORKDIR /build/src
RUN dotnet publish --output /build/app/ --configuration Release

# Remove NuGet.config as it contains PAT token for AppCenter package feed
RUN rm -f ./NuGet.config

###### Create final container
FROM xddevacr.azurecr.io/dotnet-2.1-aspnetcore-runtime

COPY --from=builder --chown=dotnet /build/app/ /app/

WORKDIR /app

CMD ["dotnet", "product-catalog-web.dll"]