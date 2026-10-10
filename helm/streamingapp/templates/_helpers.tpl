{{/*
Expand the name of the chart.
*/}}
{{- define "streamingapp.name" -}}
{{- .Chart.Name -}}
{{- end }}

{{/*
Create a fully qualified app name.
*/}}
{{- define "streamingapp.fullname" -}}
{{- .Release.Name -}}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "streamingapp.labels" -}}
app.kubernetes.io/name: {{ include "streamingapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
