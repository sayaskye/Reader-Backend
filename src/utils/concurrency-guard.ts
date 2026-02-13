let activeJobs = 0;

const MAX_CONCURRENT_JOBS = 1;

export function acquireSlot() {
  if (activeJobs >= MAX_CONCURRENT_JOBS) {
    return false;
  }

  activeJobs++;
  return true;
}

export function releaseSlot() {
  activeJobs--;
}

export function getActiveJobs() {
  return activeJobs;
}
