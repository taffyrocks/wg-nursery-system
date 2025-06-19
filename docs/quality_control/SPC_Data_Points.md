# Conceptual SPC (Statistical Process Control) Data Points

This document outlines potential data points from our conceptual nursery management system models that could be used for Statistical Process Control (SPC) analysis. SPC helps in monitoring, controlling, and improving processes by tracking key metrics over time.

## 1. Germination Process Control

*   **Metric:** Batch Germination Rate (%)
    *   **Description:** Percentage of seeds that successfully germinate in a batch.
    *   **Source Model:** `PlantBatch`
    *   **Source Field:** `calculatedGerminationRate` (to be added/calculated based on germination records)
    *   **Tracking Dimensions:**
        *   Per `plantVarietyCode` over time.
        *   Per `supplierCode` (seed supplier) over time.
        *   Comparison across different germination environments (if `locationId` is tracked for germination).
    *   **Control Chart Type (Conceptual):** p-chart (for proportions) or XmR chart for rates if batch sizes vary significantly.

*   **Metric:** Average Days to Germination
    *   **Description:** Average time taken for seeds in a batch to germinate.
    *   **Source Model:** `PlantBatch`
    *   **Source Field:** `daysToGermination` (to be calculated based on germination records)
    *   **Tracking Dimensions:**
        *   Per `plantVarietyCode` over time.
        *   Per seed treatment type (if tracked).
    *   **Control Chart Type (Conceptual):** X-bar and R chart or XmR chart.

## 2. Environmental Process Control

*   **Metric:** Daily/Weekly Average Temperature - Specific Location
    *   **Description:** Average temperature in a critical environment (e.g., a germination chamber or greenhouse section).
    *   **Source Model:** `EnvironmentalLog`
    *   **Source Fields:** `timestamp`, `temperatureCelsius`
    *   **Tracking Dimensions:**
        *   Daily or weekly rolling average for a specific `locationId`.
    *   **Control Chart Type (Conceptual):** X-bar and R chart or XmR chart.

*   **Metric:** Daily/Weekly Average Humidity - Specific Location
    *   **Description:** Average relative humidity in a critical environment.
    *   **Source Model:** `EnvironmentalLog`
    *   **Source Fields:** `timestamp`, `relativeHumidityPercent`
    *   **Tracking Dimensions:**
        *   Daily or weekly rolling average for a specific `locationId`.
    *   **Control Chart Type (Conceptual):** X-bar and R chart or XmR chart.

## 3. Plant Growth & Health Process Control

*   **Metric:** Seedling Inspection Pass/Fail Rate (for specific critical parameters)
    *   **Description:** Percentage of seedlings passing a specific check during routine inspections (e.g., "Presence of True Leaves at Week 2", "Root System Health at Week 4").
    *   **Source Model:** `InspectionRecord`
    *   **Source Fields:** `inspectionType`, `findings` (specifically the `status` of a consistently checked `parameterChecked`).
    *   **Tracking Dimensions:**
        *   Per `plantVarietyCode` over time for a specific `inspectionType` and `parameterChecked`.
    *   **Control Chart Type (Conceptual):** p-chart or np-chart.

*   **Metric:** Pest/Disease Incidence Rate
    *   **Description:** Frequency or count of pest/disease occurrences found during inspections.
    *   **Source Model:** `InspectionRecord`
    *   **Source Fields:** `inspectionType` (e.g., "Pest & Disease Sweep"), `findings` (where `parameterChecked` relates to specific pests/diseases and `status` is 'FAIL' or `observationValue` indicates presence).
    *   **Tracking Dimensions:**
        *   Per `locationId` over time.
        *   Per `plantVarietyCode` over time.
    *   **Control Chart Type (Conceptual):** c-chart or u-chart (for counts of defects/events).

*   **Metric:** Average Seedling Height (at specific checkpoints)
    *   **Description:** Tracking average height of seedlings for a given variety at standard inspection times.
    *   **Source Model:** `PlantBatch` (field like `averageHeightAtWeek4Cm` - to be added) or derived from `InspectionRecord` findings.
    *   **Source Field:** A dedicated field on `PlantBatch` or analysis of `InspectionRecord.findings` where `parameterChecked` is "Seedling Height".
    *   **Tracking Dimensions:** Per `plantVarietyCode` over time.
    *   **Control Chart Type (Conceptual):** X-bar and R chart.

## 4. Quality Grading Process Control

*   **Metric:** Batch Quality Grade Distribution
    *   **Description:** Proportion of batches achieving Grade A, B, C, etc.
    *   **Source Model:** `PlantBatch`
    *   **Source Field:** `qualityGrade`
    *   **Tracking Dimensions:**
        *   Overall, per month/quarter.
        *   Per `plantVarietyCode` over time.
    *   **Control Chart Type (Conceptual):** p-chart (for proportion of 'Grade A') or custom dashboard.

## Notes for Implementation:

*   Consistent data entry is crucial for meaningful SPC.
*   Clear operational definitions for all parameters and metrics are required.
*   The actual implementation of SPC charts would require a data aggregation and visualization layer not covered by these conceptual models.
*   Thresholds for control limits would be determined after collecting sufficient baseline data.

This list is not exhaustive but provides a starting point for identifying valuable metrics for process control in the nursery.
