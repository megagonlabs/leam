from setuptools import setup, find_namespace_packages

setup(
    name="vta",
    version="1.0",
    packages=find_namespace_packages(include=["namespace.*"]),
)
