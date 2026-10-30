ARG BASE_IMAGE=debian:bookworm-slim
FROM ${BASE_IMAGE} AS dev
RUN useradd -m -u 1234 dev
FROM dev AS release
RUN echo release > /release
