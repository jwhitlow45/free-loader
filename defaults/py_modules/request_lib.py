#!/usr/bin/env python3

import json
import os
import typing
import urllib.error
import urllib.parse
import urllib.request
import ssl
from email.message import Message


class Response(typing.NamedTuple):
    body: str
    headers: Message
    status: int
    error_count: int = 0

    def json(self) -> typing.Any:
        """
        Decode body's JSON.

        Returns:
            Pythonic representation of the JSON object
        """
        try:
            output = json.loads(self.body)
        except json.JSONDecodeError:
            output = ""
        return output


def _read_plugin_version() -> str:
    # walk upward to find the plugin root's package.json, as this file is
    # reached via the py_modules symlink in development but may also be
    # resolved to its real location one level deeper under defaults/
    directory = os.path.dirname(os.path.abspath(__file__))
    for _ in range(3):
        directory = os.path.dirname(directory)
        package_json_path = os.path.join(directory, "package.json")
        if os.path.isfile(package_json_path):
            try:
                with open(package_json_path, "r") as package_file:
                    return str(json.load(package_file)["version"])
            except Exception:
                return "unknown"
    return "unknown"


USER_AGENT = (
    f"FreeLoader/{_read_plugin_version()} (https://github.com/jwhitlow45/free-loader)"
)


def _create_ssl_context() -> ssl.SSLContext:
    context = ssl.create_default_context()
    if context.cert_store_stats()["x509_ca"] > 0:
        return context
    # bundled/embedded Pythons (e.g. Decky's) have no CA paths baked in;
    # fall back to well-known system CA bundle locations
    for ca_file in (
        "/etc/ssl/certs/ca-certificates.crt",  # SteamOS / Arch / Debian
        "/etc/ssl/cert.pem",  # Arch compat symlink, macOS
        "/etc/pki/tls/certs/ca-bundle.crt",  # Fedora / RHEL
    ):
        if os.path.isfile(ca_file):
            context.load_verify_locations(cafile=ca_file)
            break
    return context


def request(
    url: str,
    data: dict[str, typing.Any] | None = None,
    params: dict[str, typing.Any] | None = None,
    headers: dict[str, typing.Any] | None = None,
    method: str = "GET",
    data_as_json: bool = True,
    error_count: int = 0,
    timeout: float = 15,
) -> Response:
    if not url.casefold().startswith("http"):
        raise urllib.error.URLError("Incorrect and possibly insecure protocol in url")
    method = method.upper()
    request_data = None
    headers = headers or {}
    data = data or {}
    params = params or {}
    headers = {"Accept": "application/json", "User-Agent": USER_AGENT, **headers}

    if method == "GET":
        params = {**params, **data}
        data = None

    if params:
        separator = "&" if "?" in url else "?"
        url += separator + urllib.parse.urlencode(params, doseq=True, safe="/")

    if data:
        if data_as_json:
            request_data = json.dumps(data).encode()
            headers["Content-Type"] = "application/json; charset=UTF-8"
        else:
            request_data = urllib.parse.urlencode(data).encode()

    httprequest = urllib.request.Request(
        url, data=request_data, headers=headers, method=method
    )

    context = _create_ssl_context()

    try:
        with urllib.request.urlopen(
            httprequest, context=context, timeout=timeout
        ) as httpresponse:
            response = Response(
                headers=httpresponse.headers,
                status=httpresponse.status,
                body=httpresponse.read().decode(
                    httpresponse.headers.get_content_charset("utf-8")
                ),
            )
    except urllib.error.HTTPError as e:
        response = Response(
            body=str(e.reason),
            headers=e.headers,
            status=e.code,
            error_count=error_count + 1,
        )

    return response
