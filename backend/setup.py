from setuptools import setup, find_namespace_packages

setup(
    name="explorer_app",
    version="1.0",
    packages=find_namespace_packages(include=["namespace.*"]),
)
