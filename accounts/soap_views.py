import logging
import re

from requests.exceptions import RequestException
from zeep import Client
from zeep.exceptions import Error as ZeepError
from zeep.transports import Transport
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

COUNTRY_INFO_WSDL = (
    "http://webservices.oorsprong.org/websamples.countryinfo/"
    "CountryInfoService.wso?WSDL"
)
COUNTRY_NOT_FOUND = "Country not found in the database"


class SoapCountryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        country_code = request.query_params.get("code", "").strip().upper()
        if not re.fullmatch(r"[A-Z]{2}", country_code):
            return Response(
                {"detail": "El código ISO del país debe contener dos letras."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            client = Client(
                COUNTRY_INFO_WSDL,
                transport=Transport(timeout=10, operation_timeout=10),
            )
            country_name = client.service.CountryName(country_code)
            if (
                not country_name
                or country_name.casefold() == COUNTRY_NOT_FOUND.casefold()
            ):
                return Response(
                    {"detail": "El código ISO del país no es válido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            capital = client.service.CapitalCity(country_code)
        except (RequestException, ZeepError):
            logger.exception(
                "No fue posible consultar el servicio SOAP para el país %s.",
                country_code,
            )
            return Response(
                {"detail": "El servicio SOAP de países no está disponible."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "code": country_code,
                "name": country_name,
                "capital": capital,
            },
            status=status.HTTP_200_OK,
        )
