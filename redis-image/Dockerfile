# Use an existing docker image.
FROM alpine


# Download and install dependency
RUN apk add --update redis

# Tell the image what to do when it starts as a container
CMD ["redis-server"]